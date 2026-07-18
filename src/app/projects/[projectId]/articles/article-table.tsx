"use client";

import React, { useOptimistic, useState, useTransition } from "react";
import { updateArticleStatus } from "~/server/actions/articles";
import { NotesPanel } from "./notes-panel";
import type { Article, ReviewStatus, ReviewNote } from "~/generated/prisma";

const STATUS_STYLES: Record<string, string> = {
  UNSCREENED: "bg-slate-100 text-slate-700 border-slate-200/60",
  INCLUDED: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  EXCLUDED: "bg-rose-50 text-rose-700 border-rose-200/50",
  MAYBE: "bg-amber-50 text-amber-700 border-amber-200/50",
};

export function ArticleTable({
  articles,
  projectId,
}: {
  articles: (Article & { reviewNotes: ReviewNote[] })[];
  projectId: string;
}) {
  const [optimisticArticles, setOptimisticStatus] = useOptimistic(
    articles,
    (state, { id, status }: { id: string; status: ReviewStatus }) =>
      state.map((a) => (a.id === id ? { ...a, status } : a)),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleStatusChange(articleId: string, status: ReviewStatus) {
    startTransition(async () => {
      setOptimisticStatus({ id: articleId, status });
      try {
        await updateArticleStatus(articleId, projectId, status);
      } catch {
        // optimistic state reverts automatically
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm animate-fade-in">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">First Author</th>
            <th className="px-6 py-4">Journal</th>
            <th className="px-6 py-4">Year</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {optimisticArticles.map((article) => (
            <React.Fragment key={article.id}>
              <tr
                className="cursor-pointer hover:bg-slate-50/40 transition-colors group"
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              >
                <td className="px-6 py-4 font-semibold text-slate-800">
                  <div className="flex items-start gap-2.5 max-w-lg">
                    <span className="text-[10px] mt-1.5 text-slate-300 group-hover:text-slate-500 transition-colors">
                      {expandedId === article.id ? "▼" : "▶"}
                    </span>
                    <span className="line-clamp-2 hover:text-violet-650 transition-colors">{article.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{article.firstAuthor ?? "—"}</td>
                <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[180px]">{article.journal ?? "—"}</td>
                <td className="px-6 py-4 text-slate-500 font-medium">{article.publicationYear ?? "—"}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={article.status}
                    onChange={(e) => handleStatusChange(article.id, e.target.value as ReviewStatus)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer ${STATUS_STYLES[article.status]}`}
                  >
                    <option value="UNSCREENED">Unscreened</option>
                    <option value="INCLUDED">Include</option>
                    <option value="EXCLUDED">Exclude</option>
                    <option value="MAYBE">Maybe</option>
                  </select>
                </td>
              </tr>
              {expandedId === article.id && (
                <tr className="bg-slate-50/50">
                  <td colSpan={5} className="px-10 py-5 border-t border-slate-100">
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Reviewer Discussion & Notes
                      </div>
                      <NotesPanel
                        articleId={article.id}
                        projectId={projectId}
                        initialNotes={article.reviewNotes}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}