import PDFDocument from "pdfkit";

import type { SheetDefinition } from "./xlsx";

const PAGE_MARGIN = 40;
const HEADER_ROW_HEIGHT = 20;
const ROW_HEIGHT = 18;
const FONT_SIZE = 9;
const MIN_COLUMN_WIDTH = 60;

function drawTable(doc: PDFKit.PDFDocument, sheet: SheetDefinition): void {
  doc.fontSize(14).font("Helvetica-Bold").text(sheet.name, PAGE_MARGIN, doc.y);
  doc.moveDown(0.5);

  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const totalWeight = sheet.columns.reduce((sum, column) => sum + (column.width ?? 22), 0);
  const columnWidths = sheet.columns.map((column) =>
    Math.max(MIN_COLUMN_WIDTH, ((column.width ?? 22) / totalWeight) * usableWidth),
  );

  function drawRow(values: string[], y: number, bold: boolean): void {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(FONT_SIZE);
    let x = PAGE_MARGIN;
    values.forEach((value, index) => {
      doc.text(value, x, y, { width: columnWidths[index], ellipsis: true });
      x += columnWidths[index];
    });
  }

  function ensureSpace(rowHeight: number): void {
    if (doc.y + rowHeight > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
    }
  }

  ensureSpace(HEADER_ROW_HEIGHT);
  const headerY = doc.y;
  drawRow(
    sheet.columns.map((c) => c.header),
    headerY,
    true,
  );
  doc.y = headerY + HEADER_ROW_HEIGHT;

  for (const row of sheet.rows) {
    ensureSpace(ROW_HEIGHT);
    const rowY = doc.y;
    drawRow(
      sheet.columns.map((column) => String(row[column.key] ?? "")),
      rowY,
      false,
    );
    doc.y = rowY + ROW_HEIGHT;
  }
}

export async function buildPdfResponse(sheets: SheetDefinition[], filename: string): Promise<Response> {
  const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4", layout: "landscape" });
  const chunks: Buffer[] = [];

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    sheets.forEach((sheet, index) => {
      if (index > 0) doc.addPage();
      drawTable(doc, sheet);
    });

    doc.end();
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
