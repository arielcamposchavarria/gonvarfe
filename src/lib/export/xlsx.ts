import ExcelJS from "exceljs";

export interface SheetColumn {
  header: string;
  key: string;
  width?: number;
}

export interface SheetDefinition {
  name: string;
  columns: SheetColumn[];
  rows: Record<string, unknown>[];
}

const COMBINING_DIACRITICS = /\p{Diacritic}/gu;

/** Nombre de archivo seguro a partir de un texto libre (p. ej. el nombre de un guard). */
export function slugifyFilename(text: string): string {
  const normalized = text
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "reporte";
}

export async function buildXlsxResponse(sheets: SheetDefinition[], filename: string): Promise<Response> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);
    worksheet.columns = sheet.columns.map((column) => ({
      header: column.header,
      key: column.key,
      width: column.width ?? 22,
    }));
    worksheet.getRow(1).font = { bold: true };
    worksheet.addRows(sheet.rows);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
