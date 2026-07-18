import type {
  RawImportRow,
  RowValidationResult,
  NormalizedArticleData,
} from "./types";

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDoi(value: unknown): string | null {
  const cleaned = cleanString(value);
  if (!cleaned) return null;
  return cleaned.replace(/^doi:\s*/i, "").toLowerCase();
}

function normalizePmid(value: unknown): string | null {
  const pmidStr = typeof value === "string" || typeof value === "number" ? String(value) : "";
  return cleanString(pmidStr.trim() ?? null);
}

function normalizeYear(value: unknown): {
  year: number | null;
  warning: string | null;
} {
  if (value === null || value === undefined || value === "") {
    return { year: null, warning: null };
  }
  const asNumber = typeof value === "number" ? value : Number(value);
  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(asNumber) || !Number.isInteger(asNumber)) {
    const yearStr = typeof value === "string" || typeof value === "number" ? String(value) : "unknown";
    return { year: null, warning: `Publication Year "${yearStr}" is not a valid number` };
  }
  if (asNumber < 1900 || asNumber > currentYear + 1) {
    return { year: null, warning: `Publication Year ${asNumber} is outside a plausible range` };
  }
  return { year: asNumber, warning: null };
}

function normalizeDate(value: unknown): Date | null {
  const cleaned = cleanString(value);
  if (!cleaned) return null;
  const parsed = new Date(cleaned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function validateAndNormalizeRow(row: RawImportRow): RowValidationResult {
  const title = cleanString(row.Title);

  // Title is the one hard requirement — everything else degrades gracefully.
  if (!title) {
    return {
      outcome: "SKIPPED_INVALID",
      article: null,
      error: "Missing required field: Title",
    };
  }

  const { year, warning: yearWarning } = normalizeYear(row["Publication Year"]);

  const article: NormalizedArticleData = {
    pmid: normalizePmid(row.PMID),
    title,
    authors: cleanString(row.Authors),
    citation: cleanString(row.Citation),
    firstAuthor: cleanString(row["First Author"]),
    journal: cleanString(row["Journal/Book"]),
    publicationYear: year,
    createDate: normalizeDate(row["Create Date"]),
    pmcid: cleanString(row.PMCID),
    nihmsId: cleanString(row["NIHMS ID"]),
    doi: normalizeDoi(row.DOI),
  };

  if (yearWarning) {
    return { outcome: "IMPORTED_WITH_WARNING", article, error: yearWarning };
  }

  return { outcome: "IMPORTED", article, error: null };
}