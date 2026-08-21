import { describe, expect, it } from "vitest";

import { slugifyFilename, buildXlsxResponse } from "./xlsx";

describe("slugifyFilename", () => {
  it("normaliza tildes, espacios y mayúsculas a un slug en minúsculas", () => {
    expect(slugifyFilename("Mario Solano")).toBe("mario-solano");
    expect(slugifyFilename("Plaza Amará #1")).toBe("plaza-amara-1");
  });

  it("devuelve un valor por defecto si el texto queda vacío", () => {
    expect(slugifyFilename("###")).toBe("reporte");
  });
});

describe("buildXlsxResponse", () => {
  it("genera una respuesta descargable con el nombre de archivo y tipo de contenido correctos", async () => {
    const response = await buildXlsxResponse(
      [{ name: "Hoja 1", columns: [{ header: "Nombre", key: "name" }], rows: [{ name: "Ana" }] }],
      "reporte.xlsx",
    );

    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="reporte.xlsx"');

    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
