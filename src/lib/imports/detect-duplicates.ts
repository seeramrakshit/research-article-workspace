import type { NormalizedArticleData, RowValidationResult } from "./types";

export interface DuplicateCheckContext {
  existingDois: Set<string>; 
  existingPmids: Set<string>;
}

export function applyDuplicateCheck(
  result: RowValidationResult,
  ctx: DuplicateCheckContext,
): RowValidationResult {
  if (result.outcome === "SKIPPED_INVALID" || !result.article) {
    return result;
  }

  const { doi, pmid } = result.article;

  if (doi && ctx.existingDois.has(doi)) {
    return { outcome: "SKIPPED_DUPLICATE", article: result.article, error: `Duplicate DOI: ${doi}` };
  }
  if (pmid && ctx.existingPmids.has(pmid)) {
    return { outcome: "SKIPPED_DUPLICATE", article: result.article, error: `Duplicate PMID: ${pmid}` };
  }

  // Not a duplicate — register it so later rows in the same file see it.
  if (doi) ctx.existingDois.add(doi);
  if (pmid) ctx.existingPmids.add(pmid);

  return result;
}