import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateLocalForm } from "./create-local-form";

vi.mock("@/app/admin/sitios/actions", () => ({
  createLocalAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("sitioId") === "sitio-inexistente") {
      return { error: 'No se encontró el sitio "sitio-inexistente".' };
    }
    return { error: null };
  }),
}));

describe("CreateLocalForm", () => {
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
  });
});
