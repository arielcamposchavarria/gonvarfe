import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ExportButton } from "./export-button";

describe("ExportButton", () => {
  it("ofrece un enlace de descarga en Excel apuntando al href base", () => {
    render(<ExportButton href="/admin/guards/guard-1/rounds/export" />);

    expect(screen.getByRole("link", { name: /descargar excel/i })).toHaveAttribute(
      "href",
      "/admin/guards/guard-1/rounds/export",
    );
  });

  it("ofrece un enlace de descarga en PDF con el query param format=pdf", () => {
    render(<ExportButton href="/admin/guards/guard-1/rounds/export" />);

    expect(screen.getByRole("link", { name: /descargar pdf/i })).toHaveAttribute(
      "href",
      "/admin/guards/guard-1/rounds/export?format=pdf",
    );
  });

  it("agrega format=pdf con & cuando el href ya trae un query string", () => {
    render(<ExportButton href="/admin/guards/guard-1/rounds/export?from=2026-01-01" />);

    expect(screen.getByRole("link", { name: /descargar pdf/i })).toHaveAttribute(
      "href",
      "/admin/guards/guard-1/rounds/export?from=2026-01-01&format=pdf",
    );
  });

  it("permite personalizar las etiquetas de cada formato", () => {
    render(<ExportButton href="/x/export" excelLabel="Excel: todo" pdfLabel="PDF: todo" />);

    expect(screen.getByRole("link", { name: "Excel: todo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF: todo" })).toBeInTheDocument();
  });
});
