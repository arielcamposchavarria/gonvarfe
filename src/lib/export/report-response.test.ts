import { describe, expect, it } from "vitest";

import { parseReportFormat, buildReportResponse } from "./report-response";

const SHEETS = [{ name: "Hoja 1", columns: [{ header: "Nombre", key: "name" }], rows: [{ name: "Ana" }] }];

describe("parseReportFormat", () => {
  it("devuelve xlsx por defecto cuando no hay parámetro format", () => {
    expect(parseReportFormat(new Request("https://app.test/export"))).toBe("xlsx");
  });

  it("devuelve pdf cuando format=pdf", () => {
    expect(parseReportFormat(new Request("https://app.test/export?format=pdf"))).toBe("pdf");
  });

  it("devuelve xlsx para cualquier otro valor no reconocido", () => {
    expect(parseReportFormat(new Request("https://app.test/export?format=csv"))).toBe("xlsx");
  });
});

describe("buildReportResponse", () => {
  it("genera un xlsx con extensión .xlsx", async () => {
    const response = await buildReportResponse("xlsx", SHEETS, "reporte");

    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="reporte.xlsx"');
  });

  it("genera un pdf con extensión .pdf", async () => {
    const response = await buildReportResponse("pdf", SHEETS, "reporte");

    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="reporte.pdf"');
  });
});
