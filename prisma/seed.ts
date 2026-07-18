import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

async function main() {
  // ---- Users ----
  const aisha = await db.user.upsert({
    where: { email: "aisha.parker@example.com" },
    update: {},
    create: { email: "aisha.parker@example.com", name: "Aisha (Org Owner)" },
  });

  const ben = await db.user.upsert({
    where: { email: "ben.carter@example.com" },
    update: {},
    create: { email: "ben.carter@example.com", name: "Ben (Reviewer)" },
  });

  const carla = await db.user.upsert({
    where: { email: "carla.wright@example.com" },
    update: {},
    create: { email: "carla.wright@example.com", name: "Carla (No Beta Access)" },
  });

  // ---- Organizations ----
  const orgOne = await db.organization.upsert({
    where: { slug: "northbridge-medical-research" },
    update: {},
    create: { name: "Northbridge Medical Research Institute", slug: "northbridge-medical-research" },
  });

  const orgTwo = await db.organization.upsert({
    where: { slug: "center-clinical-evidence" },
    update: {},
    create: { name: "Center for Clinical Evidence", slug: "center-clinical-evidence" },
  });

  // ---- Org-level memberships ----
  await db.membership.upsert({
    where: { userId_organizationId: { userId: aisha.id, organizationId: orgOne.id } },
    update: {},
    create: { userId: aisha.id, organizationId: orgOne.id, role: "OWNER" },
  });

  await db.membership.upsert({
    where: { userId_organizationId: { userId: ben.id, organizationId: orgOne.id } },
    update: {},
    create: { userId: ben.id, organizationId: orgOne.id, role: "MEMBER" },
  });

  await db.membership.upsert({
    where: { userId_organizationId: { userId: carla.id, organizationId: orgOne.id } },
    update: {},
    create: { userId: carla.id, organizationId: orgOne.id, role: "MEMBER" },
  });

  // carla also belongs to orgTwo, just to prove org-membership alone
  // doesn't grant project access
  await db.membership.upsert({
    where: { userId_organizationId: { userId: carla.id, organizationId: orgTwo.id } },
    update: {},
    create: { userId: carla.id, organizationId: orgTwo.id, role: "MEMBER" },
  });

  // ---- Projects ----
  const projectAlpha = await db.project.upsert({
    where: {
      organizationId_name: {
        organizationId: orgOne.id,
        name: "Telehealth Interventions for Chronic Disease Management",
      },
    },
    update: {},
    create: {
      organizationId: orgOne.id,
      name: "Telehealth Interventions for Chronic Disease Management",
    },
  });

  const projectBeta = await db.project.upsert({
    where: {
      organizationId_name: {
        organizationId: orgOne.id,
        name: "Medication Adherence in Cardiovascular Care",
      },
    },
    update: {},
    create: {
      organizationId: orgOne.id,
      name: "Medication Adherence in Cardiovascular Care",
    },
  });

  // ---- Project-level memberships ----
  // Alpha: aisha (owner), ben (reviewer) — carla deliberately excluded
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: aisha.id, projectId: projectAlpha.id } },
    update: {},
    create: { userId: aisha.id, projectId: projectAlpha.id, role: "OWNER" },
  });
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: ben.id, projectId: projectAlpha.id } },
    update: {},
    create: { userId: ben.id, projectId: projectAlpha.id, role: "REVIEWER" },
  });

  // Beta: aisha (owner), ben (reviewer) — carla still excluded here too,
  // this is the project you'll use to prove she gets denied
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: aisha.id, projectId: projectBeta.id } },
    update: {},
    create: { userId: aisha.id, projectId: projectBeta.id, role: "OWNER" },
  });
  await db.projectMember.upsert({
    where: { userId_projectId: { userId: ben.id, projectId: projectBeta.id } },
    update: {},
    create: { userId: ben.id, projectId: projectBeta.id, role: "REVIEWER" },
  });

  // ---- A couple of seed articles so the table isn't empty on first load ----
  await db.article.upsert({
    where: { projectId_pmid: { projectId: projectAlpha.id, pmid: "39201042" } },
    update: {},
    create: {
      projectId: projectAlpha.id,
      pmid: "39201042",
      title: "Effectiveness of home-based telehealth program for heart failure patients",
      authors: "Parker A; Adams J; Rogers E",
      firstAuthor: "Parker A",
      journal: "New England Journal of Telemedicine",
      publicationYear: 2024,
      doi: "10.1056/nejt.2024.1102",
      status: "UNSCREENED",
    },
  });

  await db.article.upsert({
    where: { projectId_pmid: { projectId: projectAlpha.id, pmid: "38190240" } },
    update: {},
    create: {
      projectId: projectAlpha.id,
      pmid: "38190240",
      title: "Mobile health applications for chronic obstructive pulmonary disease management: a systematic review",
      authors: "Davis M; Sterling K",
      firstAuthor: "Davis M",
      journal: "Lancet Digital Health",
      publicationYear: 2023,
      doi: "10.1016/ldh.2023.08.012",
      status: "EXCLUDED",
    },
  });

  await db.article.upsert({
    where: { projectId_pmid: { projectId: projectBeta.id, pmid: "39042180" } },
    update: {},
    create: {
      projectId: projectBeta.id,
      pmid: "39042180",
      title: "Impact of mobile text message reminders on medication adherence in patients with coronary heart disease",
      authors: "Carter B; Bennett R; Jenkins T",
      firstAuthor: "Carter B",
      journal: "Circulation: Cardiovascular Quality and Outcomes",
      publicationYear: 2025,
      doi: "10.1161/circout.2025.104",
      status: "UNSCREENED",
    },
  });

  await db.article.upsert({
    where: { projectId_pmid: { projectId: projectBeta.id, pmid: "37910045" } },
    update: {},
    create: {
      projectId: projectBeta.id,
      pmid: "37910045",
      title: "Polypill vs. standard care for medication adherence in secondary prevention of cardiovascular disease",
      authors: "Gonzalez M; Perez R",
      firstAuthor: "Gonzalez M",
      journal: "Journal of the American College of Cardiology",
      publicationYear: 2022,
      doi: "10.1016/jacc.2022.09.009",
      status: "INCLUDED",
    },
  });

  console.log("Seed complete:");
  console.log({
    users: { aisha: aisha.email, ben: ben.email, carla: carla.email },
    orgs: { orgOne: orgOne.slug, orgTwo: orgTwo.slug },
    projects: { projectAlpha: projectAlpha.id, projectBeta: projectBeta.id },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });