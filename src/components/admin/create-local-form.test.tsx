import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateLocalForm } from "./create-local-form";

const { notifySuccessMock } = vi.hoisted(() => ({ notifySuccessMock: vi.fn() }));

vi.mock("@/app/admin/sitios/actions", () => ({
  createLocalAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("sitioId") === "sitio-inexistente") {
      return { error: 'No se encontró el sitio "sitio-inexistente".' };
    }
    return { error: null };
  }),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

describe("CreateLocalForm", () => {
  beforeEach(() => {
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("incluye el sitioId como campo oculto", () => {
    render(<CreateLocalForm sitioId="sitio-1" />);

    const hiddenInput = document.querySelector('input[name="sitioId"]');
    expect(hiddenInput).toHaveValue("sitio-1");
  });

  it("muestra el error devuelto por la acción cuando el sitio no existe", async () => {
    const user = userEvent.setup();
    render(<CreateLocalForm sitioId="sitio-inexistente" />);

    await user.type(screen.getByLabelText(/nuevo local/i), "Panadería El Trigo");
    await user.click(screen.getByRole("button", { name: /agregar local/i }));

    expect(await screen.findByText(/no se encontró el sitio/i)).toBeInTheDocument();
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("al agregar exitosamente, muestra un SweetAlert de éxito y limpia el campo", async () => {
    const user = userEvent.setup();
    render(<CreateLocalForm sitioId="sitio-1" />);

    const input = screen.getByLabelText(/nuevo local/i);
    await user.type(input, "Panadería El Trigo");
    await user.click(screen.getByRole("button", { name: /agregar local/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Local agregado"));
    await waitFor(() => expect(input).toHaveValue(""));
  });
});
