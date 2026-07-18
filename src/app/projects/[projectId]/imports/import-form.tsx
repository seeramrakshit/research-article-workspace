"use client";

import { useState } from "react";
import { importArticlesFromXlsx, type ImportSummary } from "~/server/actions/import-articles";

export function ImportForm({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      setError("Choose a file first.");
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = await importArticlesFromXlsx(projectId, buffer, file.name);
      setSummary(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="flex items-center gap-3">
        <input type="file" name="file" accept=".xlsx" required />
        <button type="submit" disabled={isPending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {isPending ? "Importing…" : "Import"}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {summary && (
        <div className="rounded border p-4">
          <p className="font-medium">
            Imported {summary.importedRows} of {summary.totalRows} rows ({summary.skippedRows} skipped)
          </p>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Row</th><th>Outcome</th><th>Title</th><th>Note</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((r) => (
                <tr key={r.rowNumber} className="border-t">
                  <td>{r.rowNumber}</td>
                  <td>{r.outcome}</td>
                  <td>{r.title ?? "—"}</td>
                  <td className="text-gray-600">{r.error ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}