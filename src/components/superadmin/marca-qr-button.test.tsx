import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MarcaQrButton } from "./marca-qr-button";

const generateMarcaQrAction = vi.fn();

vi.mock("@/app/superadmin/sites/actions", () => ({
  generateMarcaQrAction: (...args: unknown[]) => generateMarcaQrAction(...args),
}));

describe("MarcaQrButton", () => {
  beforeEach(() => {
    generateMarcaQrAction.mockClear();
  });

  it("genera el QR en el primer click y lo muestra", async () => {
    generateMarcaQrAction.mockResolvedValue({ qrCodeId: "qr-123", error: null });
    const user = userEvent.setup();
    render(<MarcaQrButton sitioId="sitio-1" marca={{ id: "marca-1", nombre: "BAC", qrCodeId: null }} />);

    await user.click(screen.getByRole("button", { name: /qr/i }));

    await waitFor(() => expect(generateMarcaQrAction).toHaveBeenCalledWith("sitio-1", "marca-1"));
    expect(await screen.findByText(/qr de bac/i)).toBeInTheDocument();
  });

  it("no vuelve a llamar la acción en un segundo click", async () => {
    generateMarcaQrAction.mockResolvedValue({ qrCodeId: "qr-123", error: null });
    const user = userEvent.setup();
    render(<MarcaQrButton sitioId="sitio-1" marca={{ id: "marca-1", nombre: "BAC", qrCodeId: null }} />);

    const button = screen.getByRole("button", { name: /qr/i });
    await user.click(button);
    await waitFor(() => expect(generateMarcaQrAction).toHaveBeenCalledTimes(1));

    // Cierra el diálogo (como haría el usuario) antes de volver a abrirlo.
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText(/qr de bac/i)).not.toBeInTheDocument());

    await user.click(button);

    expect(generateMarcaQrAction).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/qr de bac/i)).toBeInTheDocument();
  });

  it("si la marca ya tiene qrCodeId, el click nunca llama a la acción", async () => {
    const user = userEvent.setup();
    render(<MarcaQrButton sitioId="sitio-1" marca={{ id: "marca-1", nombre: "BAC", qrCodeId: "qr-existente" }} />);

    await user.click(screen.getByRole("button", { name: /qr/i }));

    expect(generateMarcaQrAction).not.toHaveBeenCalled();
    expect(await screen.findByText(/qr de bac/i)).toBeInTheDocument();
  });
});
