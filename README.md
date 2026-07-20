# Article Review Workspace

A simplified article review workspace for systematic literature review workflows — organizations contain projects, projects contain imported articles, and users review articles through an Include/Exclude/Maybe workflow with notes.

Built for the EasySLR Software Engineer take-home assignment.

## Tech Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS**
- **Prisma** + **PostgreSQL**
- **NextAuth (Auth.js v5)** with a Credentials-based dev login and the Prisma adapter
- **Server Actions** as the typed backend layer (no separate tRPC router)
- **Vitest** for unit/integration tests
- **xlsx (SheetJS)** for spreadsheet parsing

## Setup

### Prerequisites
- Node.js 20+
- Docker (for local Postgres)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres
docker compose up -d

# 3. Configure environment
cp .env.example .env
# Set DATABASE_URL to your local Postgres connection string
# Generate AUTH_SECRET with: npx auth secret

# 4. Push schema and seed data
npm run db:push
npx prisma db seed

# 5. Run the app
npm run dev
```

Visit `http://localhost:3000/api/auth/signin` and sign in with one of the seeded dev accounts below (Credentials provider — email only, no password, restricted to pre-seeded users).

### Seeded accounts

| Email | Org role | Project Alpha | Project Beta |
|---|---|---|---|
| `aisha.parker@example.com` | Owner | Owner | Owner |
| `ben.carter@example.com` | Member | Reviewer | Reviewer |
| `carla.wright@example.com` | Member (both orgs) | **No access** | **No access** |

`carla.wright@example.com` is deliberately excluded from both projects despite being an org member — she exists specifically to prove project access is enforced independently of org membership, both in manual testing and in the authorization test suite.

### Running tests

```bash
npm run test
```

Covers: import row validation/normalization against literal edge-case rows from the sample file, duplicate-detection precedence, and server-side authorization enforcement (denying a user with no project membership).

## Architecture

### Domain model

```
Organization ─┬─ Membership (org-level role: OWNER / ADMIN / MEMBER)
              └─ Project ─┬─ ProjectMember (project-level role: OWNER / REVIEWER)
                          ├─ Article ─── ReviewNote
                          └─ ImportBatch ─── ImportRow ─── Article (via importRowId)
```

Two deliberately separate role layers: **org role** governs org-level actions (creating projects, managing org membership), and **project role** governs article-level actions inside a specific project. A user can be a `MEMBER` at the org level but `OWNER` of one specific project. This separation exists because visibility and review permissions should be scoped to the project someone is actually working in, not their standing across the whole organization — most reviewers on a systematic review team have no reason to see or touch every project their org runs.

Article dedup keys (`doi`, `pmid`) are unique **per project**, not globally — the same source article can legitimately be imported into two separate review projects.

### Authorization

Every server action touching `Project`, `Article`, `ImportBatch`, or `ReviewNote` data calls a single chokepoint, `requireProjectAccess(userId, projectId, minRole?)`, before running any query. It throws a typed `ForbiddenError` rather than returning a boolean, so a forgotten check fails loudly (a missing call is a visible code-review gap, not a silent hole) and a caller that ignores the return value still can't proceed.

Access is enforced at the query level, not by filtering results after fetching everything — e.g. `listMyProjects` scopes its `where` clause to `members: { some: { userId } }` rather than fetching all projects and filtering in JavaScript. For actions that take an `articleId` directly (status updates, notes), there's a second check confirming that article actually belongs to the `projectId` the user was verified against — closing the gap where a user could pass a project they legitimately own alongside an article ID borrowed from a different project.

This is proven three ways, not just asserted:
1. A Vitest test calls a server action directly, as a user with no `ProjectMember` row, and asserts it throws — bypassing the UI entirely.
2. Manual verification with two seeded users (one with access, one without) hitting the same action.
3. A dedicated `error.tsx` boundary renders a real "you don't have access" screen if a `ForbiddenError` reaches the UI, rather than a blank page or an unhandled exception.

### Article import

Import is a three-layer pipeline, split deliberately so the riskiest logic is pure and testable without a database:

1. **Parse** — `parseXlsxBuffer` turns the uploaded file into raw rows. No validation here.
2. **Validate & normalize** — `validateAndNormalizeRow(row)` is a pure function: no DB, no side effects. It trims whitespace, normalizes DOI casing and strips a stray `DOI:` prefix, coerces `Publication Year` to an int or flags it, and enforces the one hard requirement (`Title`). This function is unit tested directly against literal rows copied from the provided sample file.
3. **Duplicate check** — `applyDuplicateCheck` runs after normalization, against a per-project set of existing DOIs/PMIDs (seeded from the DB, then updated in-memory as the batch is processed, so duplicates *within* the same file are caught too, not just against existing data).

**Validation decisions, and why:**

- **`Title` is the only hard requirement.** A row with no title (present in the sample file) is rejected outright — a review workspace where you can't identify the article by row is a worse outcome than losing one bad row.
- **`Publication Year`** is coerced to an integer; if it's non-numeric text or outside a plausible range (before 1900, or more than a year in the future — the sample file includes both), the row still **imports**, with `publicationYear` set to `null` and flagged for review, rather than being rejected outright. Reserve hard rejection for missing/unparseable identity fields, not soft metadata fields.
- **Dedup precedence: DOI first, PMID second.** The sample file includes a deliberate conflict — two rows share a PMID but have different DOIs. Treating DOI as the authoritative key means that pair imports as two distinct articles rather than one being silently dropped as a duplicate. This is a defensible but debatable call: the alternative (PMID-first) would instead flag the second row as a duplicate with a conflicting DOI and needs a decision about which value wins. I chose DOI-first because DOIs are a stronger, more globally unique identifier in practice, while PMID collisions can arise from export tooling quirks. PMID is only consulted as a dedup key when a row has no DOI at all.
- **All normalization (trim, case-fold, prefix-strip) happens once**, in the pure function, not repeated inline at each comparison site.
- Every row's outcome (imported / imported-with-warning / skipped-duplicate / skipped-invalid) is recorded, along with the original raw row data, in `ImportBatch`/`ImportRow` — this is a deliberate audit trail rather than a fire-and-forget import, and it's what powers the row-level import result screen.

### Review workflow

Kept intentionally simple rather than building a custom-status system: `UNSCREENED → INCLUDED / EXCLUDED / MAYBE`, changeable inline from the table with optimistic UI, plus free-text, add-only `ReviewNote`s per article (multiple per article, author + timestamp). Notes are deliberately not editable or deletable — an audit trail of review reasoning arguably shouldn't be silently mutable, and it kept the scope appropriate for the timebox.

### Table & filtering

Filter/search/sort state lives in the URL query string, not client component state — the article list page is a Server Component that reads `searchParams`, validates them through a Zod schema (never trusts raw query params directly into a Prisma `orderBy`/`where`), and queries accordingly. This gives correct behavior on refresh, back-button navigation, and shareable/bookmarkable filtered views for free, without any client-side state synchronization code.

### Loading, empty, and error states

- `loading.tsx` provides a skeleton (toolbar + table rows) shown automatically while the Server Component's data fetch is in flight.
- Two distinct empty states, deliberately not conflated: a project with **zero articles at all** (shows an "import to get started" call to action) vs. a project with articles that **zero results match the current filters** (shows a "clear filters" prompt). Distinguished by a direct `article.count` check against the project, not by inspecting URL shape, so it stays correct if more non-filter query params are added later.
- `error.tsx` distinguishes an authorization failure (`ForbiddenError` → "you don't have access to this project," with a way back) from an authentication failure (`UnauthenticatedError` → sign-in prompt) from a generic failure (retry button), rather than showing one generic error page for all three.

## Known gaps and assumptions

- **Auth is a Credentials-based dev login (email only, no password), restricted to pre-seeded users.** No self-service signup. This was a deliberate scope choice to avoid standing up an OAuth app or email-sending service for a take-home; a production version would use a real provider.
- **Unauthenticated access currently surfaces as a thrown error caught by an error boundary, not a middleware redirect.** The more idiomatic Next.js pattern is redirecting unauthenticated users to sign-in before the route renders at all. Functionally correct for this scope, but not the version I'd ship.
- **No organization management UI yet.** Organizations, projects, and memberships are currently seeded. If I were extending this application, the next logical step would be an organization management panel where Organization Owners can:
  - Create and manage projects.
  - Invite and remove organization members.
  - Assign organization roles.
  - Add or remove project members and manage project-level permissions.
- **`ImportOutcome` enum doesn't have a distinct `IMPORTED_WITH_WARNING` value** — rows imported with a soft validation issue (bad year, etc.) are currently stored as `IMPORTED` with the warning message preserved on `ImportRow.errorMessage`, rather than having their own enum value. Either is defensible; I'd add the enum value if extending this further.
- **CSV export, bulk actions, and saved filter views** (all listed as optional enhancements) were not built, to keep the core workflow correctly scoped within the timebox.

## Deployment

### Production

The application is currently deployed on **Vercel** and uses **Neon PostgreSQL** as the production database.

The Vercel deployment demonstrates the complete application workflow, including authentication, article import, review workflow, and server-side authorization.

### AWS (SST)

I also prepared the project for deployment using **SST on AWS**.

The infrastructure was configured to deploy the Next.js application using SST while storing secrets securely through SST Secrets and using Neon PostgreSQL instead of provisioning an AWS database.

However, deployment could not be completed because the AWS account used for this assignment was newly created and CloudFront creation is currently blocked until AWS completes account verification.

Once the account restriction is removed, the existing SST configuration can be deployed without additional application changes.

## AI usage disclosure

I used ChatGPT & Gemini as an engineering assistant throughout this assignment.

### How AI was used

- Discussing architecture decisions and implementation tradeoffs.
- Reviewing the data model and authorization approach.
- Explaining unfamiliar Next.js/Auth.js concepts.
- Suggesting approaches for validation, testing, and code organization.
- Reviewing portions of the implementation for readability and maintainability.

### What I personally implemented and verified

- Designed the final data model and project-level authorization flow.
- Implemented the application features, Prisma models, server actions, and UI.
- Adapted AI suggestions where necessary to fit the application's architecture and requirements.
- Verified database migrations, authorization behavior, and the complete import/review workflow manually.
- Wrote and executed the Vitest test suite covering validation, duplicate handling, and authorization behavior.

### Example where I changed AI output

An early AI suggestion around duplicate handling did not match the behavior I wanted. I revised the implementation to align with my chosen validation strategy and database constraints, then updated the tests to verify the final behavior.

## Approximate time spent

About 8-10 hours of active design, implementation, testing, and refinement.

## What I'd improve next

1. Middleware-based authentication redirects instead of relying on the error boundary for unauthenticated requests.
2. CSV export of reviewed articles.
3. Saved filter presets.
4. Organization management panel for Organization Owners.
5. Project management UI with member assignment and role management.
6. Complete AWS deployment using SST once the AWS account restriction is removed.
7. Allow users to correct imported rows with warnings directly from the import results screen instead of re-uploading the spreadsheet.