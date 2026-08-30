import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/qr/svg-to-png", () => ({
  svgToPngDataUrl: vi.fn().mockResolvedValue("data:image/png;base64,mock"),
  downloadDataUrl: vi.fn(),
  qrFileName: (nombre: string) => `qr-${nombre.toLowerCase()}.png`,
}));

import { MarcaQrButton } from "./marca-qr-button";
import { downloadDataUrl, svgToPngDataUrl } from "@/lib/qr/svg-to-png";

const generateQrAction = vi.fn();

describe("MarcaQrButton", () => {
  beforeEach(() => {
    generateQrAction.mockClear();
    vi.mocked(svgToPngDataUrl).mockClear();
    vi.mocked(downloadDataUrl).mockClear();
  });

  it("genera el QR en el primer click y lo muestra", async () => {
    generateQrAction.mockResolvedValue({ qrCodeId: "qr-123", error: null });
    const user = userEvent.setup();
    render(
      <MarcaQrButton
        sitioId="sitio-1"
        marca={{ id: "marca-1", nombre: "BAC", qrCodeId: null }}
        generateQrAction={generateQrAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /qr/i }));

    await waitFor(() => expect(generateQrAction).toHaveBeenCalledWith("sitio-1", "marca-1"));
    expect(await screen.findByText(/qr de bac/i)).toBeInTheDocument();
  });

  it("no vuelve a llamar la acción en un segundo click", async () => {
    generateQrAction.mockResolvedValue({ qrCodeId: "qr-123", error: null });
    const user = userEvent.setup();
    render(
      <MarcaQrButton
        sitioId="sitio-1"
        marca={{ id: "marca-1", nombre: "BAC", qrCodeId: null }}
        generateQrAction={generateQrAction}
      />,
    );

    const button = screen.getByRole("button", { name: /qr/i });
    await user.click(button);
    await waitFor(() => expect(generateQrAction).toHaveBeenCalledTimes(1));

    // Cierra el diálogo (como haría el usuario) antes de volver a abrirlo.
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText(/qr de bac/i)).not.toBeInTheDocument());

    await user.click(button);

    expect(generateQrAction).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/qr de bac/i)).toBeInTheDocument();
  });

  it("si la marca ya tiene qrCodeId, el click nunca llama a la acción", async () => {
    const user = userEvent.setup();
    render(
      <MarcaQrButton
        sitioId="sitio-1"
        marca={{ id: "marca-1", nombre: "BAC", qrCodeId: "qr-existente" }}
        generateQrAction={generateQrAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /qr/i }));

    expect(generateQrAction).not.toHaveBeenCalled();
    expect(await screen.findByText(/qr de bac/i)).toBeInTheDocument();
  });

  it("al hacer click en 'Descargar' rasteriza el QR y dispara la descarga", async () => {
    const user = userEvent.setup();
    render(
      <MarcaQrButton
        sitioId="sitio-1"
        marca={{ id: "marca-1", nombre: "BAC", qrCodeId: "qr-existente" }}
        generateQrAction={generateQrAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /qr/i }));
    await user.click(await screen.findByRole("button", { name: /descargar/i }));

    await waitFor(() => expect(downloadDataUrl).toHaveBeenCalledWith("data:image/png;base64,mock", "qr-bac.png"));
  });
});
