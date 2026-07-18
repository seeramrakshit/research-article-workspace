"use client";

import { useState } from "react";
import Link from "next/link";
import { importArticlesFromXlsx, type ImportSummary } from "~/server/actions/import-articles";

const OUTCOME_STYLES: Record<string, string> = {
  IMPORTED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  IMPORTED_WITH_WARNING: "bg-amber-50 text-amber-700 border border-amber-100",
  SKIPPED_DUPLICATE: "bg-orange-50 text-orange-700 border border-orange-100",
  SKIPPED_INVALID: "bg-rose-50 text-rose-700 border border-rose-100",
};

export function ImportForm({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError("Choose a file first.");
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = await importArticlesFromXlsx(projectId, buffer, selectedFile.name);
      setSummary(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-violet-500 rounded-2xl p-8 cursor-pointer bg-slate-50/50 hover:bg-violet-50/20 transition-all group">
          <input
            type="file"
            name="file"
            accept=".xlsx"
            required
            onChange={handleFileChange}
            className="sr-only"
          />
          <div className="h-12 w-12 rounded-full bg-white text-slate-400 group-hover:text-violet-600 shadow-sm border border-slate-100 flex items-center justify-center text-xl transition-all mb-3">
            📁
          </div>
          {selectedFile ? (
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-700">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-400">Excel spreadsheets (.xlsx) only</p>
            </div>
          )}
        </label>

        <button
          type="submit"
          disabled={isPending || !selectedFile}
          className="w-full rounded-full bg-violet-600 hover:bg-violet-750 py-3 text-sm font-bold text-white transition-all shadow-md shadow-violet-100 disabled:opacity-50 disabled:shadow-none cursor-pointer"
        >
          {isPending ? "Importing database..." : "Upload and Process"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm font-medium text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {summary && (
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <p className="text-lg font-extrabold text-slate-800">
                Import complete
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Successfully processed {summary.importedRows} of {summary.totalRows} articles ({summary.skippedRows} skipped).
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/articles`}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs shadow-sm transition-all text-center self-start whitespace-nowrap"
            >
              Go to Screening Table →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.rows.map((r) => (
                  <tr key={r.rowNumber} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-500">{r.rowNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${OUTCOME_STYLES[r.outcome] || "bg-slate-100 text-slate-600"}`}>
                        {r.outcome.replace("IMPORTED_WITH_WARNING", "WARNING").replace("SKIPPED_", "")}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-800">{r.title ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-rose-600 font-medium">{r.error ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
