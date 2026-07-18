"use client";

import { useOptimistic, useState } from "react";
import { updateArticleStatus } from "~/server/actions/articles";
import { NotesPanel } from "./notes-panel";
import type { Article, ReviewStatus } from "~/generated/prisma";

const STATUS_STYLES: Record<string, string> = {
  UNSCREENED: "bg-gray-100 text-gray-700",
  INCLUDED: "bg-green-100 text-green-700",
  EXCLUDED: "bg-red-100 text-red-700",
  MAYBE: "bg-amber-100 text-amber-700",
};

export function ArticleTable({ articles, projectId }: { articles: Article[]; projectId: string }) {
  const [optimisticArticles, setOptimisticStatus] = useOptimistic(
    articles,
    (state, { id, status }: { id: string; status: ReviewStatus }) =>
      state.map((a) => (a.id === id ? { ...a, status } : a)),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleStatusChange(articleId: string, status: ReviewStatus) {
    setOptimisticStatus({ id: articleId, status });
    try {
      await updateArticleStatus(articleId, projectId, status);
    } catch {
      // optimistic state reverts automatically on next server refetch;
      // a toast here would be the polish step if time allows
    }
  }

  return (
    <table className="w-full overflow-hidden rounded-xl border border-gray-200 text-sm">
      <thead className="bg-gray-50 text-left text-gray-500">
        <tr>
          <th className="p-3">Title</th>
          <th className="p-3">First Author</th>
          <th className="p-3">Journal</th>
          <th className="p-3">Year</th>
          <th className="p-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {optimisticArticles.map((article) => (
          <>
            <tr
              key={article.id}
              className="cursor-pointer border-t hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
            >
              <td className="p-3 font-medium">{article.title}</td>
              <td className="p-3 text-gray-600">{article.firstAuthor ?? "—"}</td>
              <td className="p-3 text-gray-600">{article.journal ?? "—"}</td>
              <td className="p-3 text-gray-600">{article.publicationYear ?? "—"}</td>
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <select
                  value={article.status}
                  onChange={(e) => handleStatusChange(article.id, e.target.value as ReviewStatus)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[article.status]}`}
                >
                  <option value="UNSCREENED">Unscreened</option>
                  <option value="INCLUDED">Include</option>
                  <option value="EXCLUDED">Exclude</option>
                  <option value="MAYBE">Maybe</option>
                </select>
              </td>
            </tr>
            {expandedId === article.id && (
              <tr key={`${article.id}-notes`} className="border-t bg-gray-50">
                <td colSpan={5} className="p-4">
                  <NotesPanel articleId={article.id} projectId={projectId} />
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}