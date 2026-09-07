import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddMarcaForm } from "./add-marca-form";

const { notifySuccessMock } = vi.hoisted(() => ({ notifySuccessMock: vi.fn() }));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const action = vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
  if (formData.get("siteId") === "site-inexistente") {
    return { error: 'No se encontró el sitio "site-inexistente".' };
  }
  return { error: null };
});

describe("AddMarcaForm", () => {
  beforeEach(() => {
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("incluye el siteId como campo oculto", () => {
    render(<AddMarcaForm siteId="site-1" action={action} />);

    const hiddenInput = document.querySelector('input[name="siteId"]');
    expect(hiddenInput).toHaveValue("site-1");
  });

  it("muestra el error devuelto por la acción cuando el sitio no existe", async () => {
    const user = userEvent.setup();
    render(<AddMarcaForm siteId="site-inexistente" action={action} />);

    await user.type(screen.getByLabelText(/nueva marca/i), "Marca X");
    await user.click(screen.getByRole("button", { name: /agregar marca/i }));

    expect(await screen.findByText(/no se encontró el sitio/i)).toBeInTheDocument();
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("al agregar exitosamente, muestra un SweetAlert de éxito y limpia el campo", async () => {
    const user = userEvent.setup();
    render(<AddMarcaForm siteId="site-1" action={action} />);

    const input = screen.getByLabelText(/nueva marca/i);
    await user.type(input, "Marca X");
    await user.click(screen.getByRole("button", { name: /agregar marca/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Marca agregada"));
    await waitFor(() => expect(input).toHaveValue(""));
  });
});
