import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateGuardForm } from "./create-guard-form";

vi.mock("@/app/admin/guards/new/actions", () => ({
  createGuardAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("username") === "existente") {
      return { error: 'El usuario "existente" ya existe.' };
    }
    return { error: null };
  }),
}));

const SITES = [
  { id: "site-1", name: "Plaza Amara" },
  { id: "site-2", name: "Planta Industrial Norte" },
];

describe("CreateGuardForm", () => {
  it("muestra los campos del formulario y los sitios disponibles", () => {
    render(<CreateGuardForm sites={SITES} />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Plaza Amara" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Planta Industrial Norte" })).toBeInTheDocument();
  });

  it("muestra el error devuelto por la acción cuando el usuario ya existe", async () => {
    const user = userEvent.setup();
    render(<CreateGuardForm sites={SITES} />);

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Rojas");
    await user.type(screen.getByLabelText(/usuario/i), "existente");
    await user.type(screen.getByLabelText(/contraseña/i), "clave123");
    await user.selectOptions(screen.getByLabelText(/sitio asignado/i), "site-1");
    await user.click(screen.getByRole("button", { name: /guardar oficial/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
  });
});
