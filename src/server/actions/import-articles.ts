"use server";

import { db } from "~/server/db";
import { requireUserId } from "~/server/auth/current-user";
import { requireProjectAccess } from "~/server/auth/require-project-access";
import { parseXlsxBuffer } from "~/lib/imports/parse-xlsx";
import { validateAndNormalizeRow } from "~/lib/imports/validate-and-normalize-row";
import { applyDuplicateCheck, type DuplicateCheckContext } from "~/lib/imports/detect-duplicates";

export interface ImportSummary {
  batchId: string;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  rows: { rowNumber: number; outcome: string; error: string | null; title: string | null }[];
}

export async function importArticlesFromXlsx(
  projectId: string,
  fileBuffer: ArrayBuffer,
  filename: string,
): Promise<ImportSummary> {
  const userId = await requireUserId();
  await requireProjectAccess(userId, projectId, "OWNER"); // only owners trigger imports

  const rawRows = parseXlsxBuffer(fileBuffer);

  // Seed the dedup context with what's already in this project —
  // scoped to the project, matching the schema's @@unique([projectId, doi]).
  const existing = await db.article.findMany({
    where: { projectId },
    select: { doi: true, pmid: true },
  });
  const ctx: DuplicateCheckContext = {
    existingDois: new Set(existing.map((a) => a.doi).filter((d): d is string => !!d)),
    existingPmids: new Set(existing.map((a) => a.pmid).filter((p): p is string => !!p)),
  };

  const results = rawRows.map((row, i) => {
    const validated = validateAndNormalizeRow(row);
    const final = applyDuplicateCheck(validated, ctx);
    return { rowNumber: i + 2, ...final }; // +2: header row + 1-indexing
  });

  const importedCount = results.filter(
    (r) => r.outcome === "IMPORTED" || r.outcome === "IMPORTED_WITH_WARNING",
  ).length;

  const summary = await db.$transaction(async (tx) => {
    const batch = await tx.importBatch.create({
      data: {
        projectId,
        uploadedBy: userId,
        filename,
        totalRows: rawRows.length,
        importedRows: importedCount,
        skippedRows: rawRows.length - importedCount,
      },
    });

    for (const result of results) {
      const importRow = await tx.importRow.create({
        data: {
          importBatchId: batch.id,
          rowNumber: result.rowNumber,
          rawData: rawRows[result.rowNumber - 2] as object,
          outcome:
            result.outcome === "IMPORTED_WITH_WARNING" ? "IMPORTED" : (result.outcome as never),
          errorMessage: result.error,
        },
      });

      if ((result.outcome === "IMPORTED" || result.outcome === "IMPORTED_WITH_WARNING") && result.article) {
        await tx.article.create({
          data: { ...result.article, projectId, importRowId: importRow.id },
        });
      }
    }

    return batch;
  });

  return {
    batchId: summary.id,
    totalRows: rawRows.length,
    importedRows: importedCount,
    skippedRows: rawRows.length - importedCount,
    rows: results.map((r) => ({
      rowNumber: r.rowNumber,
      outcome: r.outcome,
      error: r.error,
      title: r.article?.title ?? null,
    })),
  };
}