import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateUserForm } from "./create-user-form";

vi.mock("@/app/superadmin/dashboard/new/actions", () => ({
  createUserAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("username") === "existente") {
      return { error: 'El usuario "existente" ya existe.' };
    }
    return { error: null };
  }),
}));

const ROLES = [
  { id: "role-1", name: "superAdmin" },
  { id: "role-2", name: "admin" },
  { id: "role-3", name: "guard" },
];

const SITES = [{ id: "site-1", name: "Plaza Amara" }];

describe("CreateUserForm", () => {
  it("muestra los campos del formulario y los roles disponibles", () => {
    render(<CreateUserForm roles={ROLES} sites={SITES} />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^rol$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/sitio asignado/i)).not.toBeInTheDocument();
  });

  it("muestra el campo de sitio asignado solo cuando el rol elegido es guard", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm roles={ROLES} sites={SITES} />);

    await user.selectOptions(screen.getByLabelText(/^rol$/i), "admin");
    expect(screen.queryByLabelText(/sitio asignado/i)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/^rol$/i), "guard");
    expect(screen.getByLabelText(/sitio asignado/i)).toBeInTheDocument();
  });

  it("muestra el error devuelto por la acción cuando el usuario ya existe", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm roles={ROLES} sites={SITES} />);

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Rojas");
    await user.type(screen.getByLabelText(/usuario/i), "existente");
    await user.type(screen.getByLabelText(/contraseña/i), "clave123");
    await user.selectOptions(screen.getByLabelText(/^rol$/i), "admin");
    await user.click(screen.getByRole("button", { name: /guardar usuario/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
  });
});
