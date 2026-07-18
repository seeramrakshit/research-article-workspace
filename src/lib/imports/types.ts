export interface RawImportRow {
  PMID?: unknown;
  Title?: unknown;
  Authors?: unknown;
  Citation?: unknown;
  "First Author"?: unknown;
  "Journal/Book"?: unknown;
  "Publication Year"?: unknown;
  "Create Date"?: unknown;
  PMCID?: unknown;
  "NIHMS ID"?: unknown;
  DOI?: unknown;
}

export interface NormalizedArticleData {
  pmid: string | null;
  title: string;
  authors: string | null;
  citation: string | null;
  firstAuthor: string | null;
  journal: string | null;
  publicationYear: number | null;
  createDate: Date | null;
  pmcid: string | null;
  nihmsId: string | null;
  doi: string | null;
}

export type RowOutcome =
  | "IMPORTED"
  | "IMPORTED_WITH_WARNING"
  | "SKIPPED_DUPLICATE"
  | "SKIPPED_INVALID";

export interface RowValidationResult {
  outcome: RowOutcome;
  article: NormalizedArticleData | null;
  error: string | null; // populated for SKIPPED_* and IMPORTED_WITH_WARNING
}