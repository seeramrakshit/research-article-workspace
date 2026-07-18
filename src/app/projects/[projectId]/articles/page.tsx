import { listProjectArticles } from "~/server/actions/articles";
import { Toolbar } from "./toolbar";
import { ArticleTable } from "./article-table";
import { db } from "~/server/db";
import Link from "next/link";

export default async function ArticlesPage({ params, searchParams}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  const [articles, projectHasAnyArticles, project] = await Promise.all([
    listProjectArticles(projectId, resolvedSearchParams),
    db.article.count({ where: { projectId } }).then((c) => c > 0),
    db.project.findUnique({ where: { id: projectId }, include: { organization: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-10 space-y-8">
      {/* Breadcrumbs / Headers */}
      <div className="space-y-1">
        {project && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>🏢</span>
            <span>{project.organization.name}</span>
            <span>/</span>
            <span className="text-slate-500">{project.name}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Literature Screening
          </h1>
          {projectHasAnyArticles && (
            <Link
              href={`/projects/${projectId}/import`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm shadow-violet-100 transition-all text-center self-start"
            >
              <span>📥</span>
              Import Database
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Toolbar projectId={projectId} />
        {articles.length === 0 ? (
          <EmptyState hasAnyArticles={projectHasAnyArticles} projectId={projectId} />
        ) : (
          <ArticleTable articles={articles} projectId={projectId} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasAnyArticles, projectId }: { hasAnyArticles: boolean; projectId: string }) {
  if (!hasAnyArticles) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center max-w-xl mx-auto shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 text-xl mb-4">
          📥
        </div>
        <h3 className="text-lg font-bold text-slate-800">No articles loaded</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          Start your screening workflow by uploading your literature database in Excel format.
        </p>
        <div className="pt-6">
          <Link
            href={`/projects/${projectId}/import`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md shadow-violet-100 transition-all"
          >
            Import Database
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center max-w-xl mx-auto shadow-sm">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 text-xl mb-4">
        🔍
      </div>
      <h3 className="text-lg font-bold text-slate-800">No matches found</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
        Your current filters didn&apos;t return any matching articles. Try modifying your search or status filter.
      </p>
      <div className="pt-6">
        <Link
          href="?"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all"
        >
          Clear Filters
        </Link>
      </div>
    </div>
  );
}