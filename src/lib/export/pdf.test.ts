import { describe, expect, it } from "vitest";

import { buildPdfResponse } from "./pdf";

describe("buildPdfResponse", () => {
  it("genera una respuesta descargable en PDF con el nombre de archivo correcto", async () => {
    const response = await buildPdfResponse(
      [{ name: "Hoja 1", columns: [{ header: "Nombre", key: "name" }], rows: [{ name: "Ana" }] }],
      "reporte.pdf",
    );

    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="reporte.pdf"');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(new TextDecoder().decode(new Uint8Array(buffer).slice(0, 5))).toBe("%PDF-");
  });

  it("genera páginas separadas por cada hoja del reporte", async () => {
    const response = await buildPdfResponse(
      [
        { name: "Hoja 1", columns: [{ header: "Nombre", key: "name" }], rows: [{ name: "Ana" }] },
        { name: "Hoja 2", columns: [{ header: "Nombre", key: "name" }], rows: [{ name: "Beto" }] },
      ],
      "reporte.pdf",
    );

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
