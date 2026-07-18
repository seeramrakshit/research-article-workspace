"use client";

import { useState, useTransition } from "react";
import { addReviewNote } from "~/server/actions/articles";

export function NotesPanel({ articleId, projectId }: { articleId: string; projectId: string }) {
  const [notes, setNotes] = useState<{ id: string; body: string; createdAt: Date }[]>([]);
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
    <div className="space-y-2">
      <ul className="space-y-1">
        {notes.map((n) => (
          <li key={n.id} className="text-sm text-gray-700">
            {n.body}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note..."
          className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="rounded-full bg-gray-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}