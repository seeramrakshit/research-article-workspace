import { listProjectArticles } from "~/server/actions/articles";
import { Toolbar } from "./toolbar";
import { ArticleTable } from "./article-table";

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  const articles = await listProjectArticles(projectId, resolvedSearchParams);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Toolbar projectId={projectId} />
      {articles.length === 0 ? (
        <EmptyState hasFilters={Object.keys(resolvedSearchParams).length > 0} />
      ) : (
        <ArticleTable articles={articles} projectId={projectId} />
      )}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-12 rounded-xl border border-dashed p-12 text-center text-gray-500">
      {hasFilters ? (
        <p>No articles match your filters. Try adjusting search or status.</p>
      ) : (
        <p>No articles yet — import a file to get started.</p>
      )}
    </div>
  );
}