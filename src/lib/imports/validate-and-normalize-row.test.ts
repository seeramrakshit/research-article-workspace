import { describe, it, expect } from "vitest";
import { validateAndNormalizeRow } from "./validate-and-normalize-row";
import { applyDuplicateCheck, type DuplicateCheckContext } from "./detect-duplicates";

function freshCtx(): DuplicateCheckContext {
  return { existingDois: new Set(), existingPmids: new Set() };
}

describe("validateAndNormalizeRow", () => {
  it("skips a row with no title (row 4)", () => {
    const result = validateAndNormalizeRow({
      PMID: "38910004",
      Title: null,
      DOI: "10.1000/example.missing-title",
    });
    expect(result.outcome).toBe("SKIPPED_INVALID");
    expect(result.article).toBeNull();
  });

  it("imports with a warning, not a rejection, for a non-numeric year (row 6)", () => {
    const result = validateAndNormalizeRow({
      PMID: "38910006",
      Title: "Invalid publication year example",
      "Publication Year": "Twenty twenty",
      DOI: "10.1000/mt.invalid-year",
    });
    expect(result.outcome).toBe("IMPORTED_WITH_WARNING");
    expect(result.article?.publicationYear).toBeNull();
  });

  it("imports with a warning for an implausible future year (row 22)", () => {
    const result = validateAndNormalizeRow({
      PMID: "38910022",
      Title: "Year as future value example",
      "Publication Year": 2035,
      DOI: "10.1000/fpe.2035.001",
    });
    expect(result.outcome).toBe("IMPORTED_WITH_WARNING");
    expect(result.article?.publicationYear).toBeNull();
  });

  it("accepts a blank PMID as long as other identity fields exist (row 21)", () => {
    const result = validateAndNormalizeRow({
      PMID: null,
      Title: "Blank PMID example",
      DOI: "10.1000/iec.2023.001",
    });
    expect(result.outcome).toBe("IMPORTED");
    expect(result.article?.pmid).toBeNull();
  });

  it("trims whitespace and strips a DOI: prefix (row 23)", () => {
    const result = validateAndNormalizeRow({
      PMID: " 38910023 ",
      Title: "Whitespace and casing example",
      Authors: "  Patel A ; Green D ",
      DOI: " DOI:10.1000/NQ.2024.010 ",
    });
    expect(result.article?.pmid).toBe("38910023");
    expect(result.article?.doi).toBe("10.1000/nq.2024.010");
    expect(result.article?.authors).toBe("Patel A ; Green D");
  });
});

describe("applyDuplicateCheck — DOI-first precedence", () => {
  it("flags row 5 as a duplicate of row 1's DOI", () => {
    const ctx = freshCtx();
    const row1 = applyDuplicateCheck(
      validateAndNormalizeRow({ PMID: "38910001", Title: "Row 1", DOI: "10.1000/jdh.2024.001" }),
      ctx,
    );
    const row5 = applyDuplicateCheck(
      validateAndNormalizeRow({ PMID: "38910005", Title: "Row 5", DOI: "10.1000/jdh.2024.001" }),
      ctx,
    );
    expect(row1.outcome).toBe("IMPORTED");
    expect(row5.outcome).toBe("SKIPPED_DUPLICATE");
  });

  it("does NOT flag row 17 as a duplicate of row 16 — same PMID, different DOI", () => {
    const ctx = freshCtx();
    const row16 = applyDuplicateCheck(
      validateAndNormalizeRow({ PMID: "38910016", Title: "Row 16", DOI: "10.1000/mht.2020.017" }),
      ctx,
    );
    const row17 = applyDuplicateCheck(
      validateAndNormalizeRow({ PMID: "38910016", Title: "Row 17", DOI: "10.1000/dql.2024.017" }),
      ctx,
    );
    expect(row16.outcome).toBe("IMPORTED");
    // DOI differs, so DOI-first precedence treats this as a distinct article
    expect(row17.outcome).toBe("IMPORTED");
  });
});