import * as XLSX from "xlsx";
import type { RawImportRow } from "./types";

export function parseXlsxBuffer(buffer: ArrayBuffer): RawImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<RawImportRow>(sheet, { defval: null });
}