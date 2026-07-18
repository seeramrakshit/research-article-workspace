"use client";

import { useState, useTransition } from "react";
import { addReviewNote } from "~/server/actions/articles";
import type { ReviewNote } from "~/generated/prisma";

export function NotesPanel({
  articleId,
  projectId,
  initialNotes,
}: {
  articleId: string;
  projectId: string;
  initialNotes: ReviewNote[];
}) {
  const [notes, setNotes] = useState<ReviewNote[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!draft.trim()) return;
    startTransition(async () => {
      const note = await addReviewNote(articleId, projectId, draft);
      setNotes((prev) => [...prev, note]);
      setDraft("");
    });
  }

  return (
    <div className="space-y-4">
      {notes.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium italic pl-1">No notes added yet.</p>
      ) : (
        <div className="space-y-2.5">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-2.5 max-w-2xl bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold shrink-0">
                👤
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Reviewer</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed break-words">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 max-w-2xl pt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note or comment..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white text-slate-800 transition-all placeholder:text-slate-400"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !draft.trim()}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Adding..." : "Add Note"}
        </button>
      </div>
    </div>
  );
}