import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/qr/svg-to-png", () => ({
  svgToPngDataUrl: vi.fn().mockResolvedValue("data:image/png;base64,mock"),
  downloadDataUrl: vi.fn(),
  qrFileName: (nombre: string) => `qr-${nombre.toLowerCase()}.png`,
}));

import { DownloadAllQrButton } from "./download-all-qr-button";
import { downloadDataUrl } from "@/lib/qr/svg-to-png";
import type { Marca } from "@/domain/entities/sitio";

const generateQrAction = vi.fn();

function marca(overrides: Partial<Marca>): Marca {
  return { id: "marca-1", nombre: "BAC", orden: 1, qrCodeId: "qr-1", activo: true, ...overrides };
}

describe("DownloadAllQrButton", () => {
  beforeEach(() => {
    generateQrAction.mockReset();
    vi.mocked(downloadDataUrl).mockClear();
  });

  it("descarga el QR de cada marca que ya tiene qrCodeId, sin llamar a generar", async () => {
    const user = userEvent.setup();
    const marcas = [marca({ id: "m1", nombre: "BAC", qrCodeId: "qr-1" }), marca({ id: "m2", nombre: "COOPEANDE", qrCodeId: "qr-2" })];
    render(<DownloadAllQrButton sitioId="sitio-1" marcas={marcas} generateQrAction={generateQrAction} />);

    await user.click(screen.getByRole("button", { name: /descargar todos/i }));

    await waitFor(() => expect(downloadDataUrl).toHaveBeenCalledTimes(2));
    expect(generateQrAction).not.toHaveBeenCalled();
    expect(downloadDataUrl).toHaveBeenCalledWith("data:image/png;base64,mock", "qr-bac.png");
    expect(downloadDataUrl).toHaveBeenCalledWith("data:image/png;base64,mock", "qr-coopeande.png");
  });

  it("genera primero el QR de las marcas que no tienen, y luego descarga todas", async () => {
    generateQrAction.mockResolvedValue({ qrCodeId: "qr-generado", error: null });
    const user = userEvent.setup();
    const marcas = [marca({ id: "m1", nombre: "BAC", qrCodeId: null })];
    render(<DownloadAllQrButton sitioId="sitio-1" marcas={marcas} generateQrAction={generateQrAction} />);

    await user.click(screen.getByRole("button", { name: /descargar todos/i }));

    await waitFor(() => expect(generateQrAction).toHaveBeenCalledWith("sitio-1", "m1"));
    await waitFor(() => expect(downloadDataUrl).toHaveBeenCalledWith("data:image/png;base64,mock", "qr-bac.png"));
  });

  it("si falla la generación de un QR, muestra el error y no descarga nada", async () => {
    generateQrAction.mockResolvedValue({ qrCodeId: null, error: "No se pudo generar." });
    const user = userEvent.setup();
    const marcas = [marca({ id: "m1", nombre: "BAC", qrCodeId: null })];
    render(<DownloadAllQrButton sitioId="sitio-1" marcas={marcas} generateQrAction={generateQrAction} />);

    await user.click(screen.getByRole("button", { name: /descargar todos/i }));

    expect(await screen.findByText(/no se pudo generar el qr de "bac"/i)).toBeInTheDocument();
    expect(downloadDataUrl).not.toHaveBeenCalled();
  });
});
