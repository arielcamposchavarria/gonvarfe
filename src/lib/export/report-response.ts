import { buildXlsxResponse, type SheetDefinition } from "./xlsx";
import { buildPdfResponse } from "./pdf";

export type ReportFormat = "xlsx" | "pdf";

export function parseReportFormat(request: Request): ReportFormat {
  const format = new URL(request.url).searchParams.get("format");
  return format === "pdf" ? "pdf" : "xlsx";
}

export function buildReportResponse(
  format: ReportFormat,
  sheets: SheetDefinition[],
  baseFilename: string,
): Promise<Response> {
  return format === "pdf"
    ? buildPdfResponse(sheets, `${baseFilename}.pdf`)
    : buildXlsxResponse(sheets, `${baseFilename}.xlsx`);
}
