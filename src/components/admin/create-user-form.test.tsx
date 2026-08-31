import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateUserForm } from "./create-user-form";

vi.mock("@/app/admin/users/new/actions", () => ({
  createUserAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("username") === "existente") {
      return { error: 'El usuario "existente" ya existe.' };
    }
    return { error: null };
  }),
}));

const ROLES = [
  { id: "role-2", name: "admin" },
  { id: "role-3", name: "guard" },
];

describe("CreateUserForm (admin)", () => {
  it("muestra los campos del formulario, con roles admin/guard y sin superAdmin", () => {
    render(<CreateUserForm roles={ROLES} />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^rol$/i)).toBeInTheDocument();
    expect(screen.queryByText(/super administrador/i)).not.toBeInTheDocument();
  });

  it("permite elegir el rol admin", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm roles={ROLES} />);

    await user.selectOptions(screen.getByLabelText(/^rol$/i), "admin");
    expect((screen.getByLabelText(/^rol$/i) as HTMLSelectElement).value).toBe("admin");
  });

  it("muestra el error devuelto por la acción cuando el usuario ya existe", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm roles={ROLES} />);

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Rojas");
    await user.type(screen.getByLabelText(/usuario/i), "existente");
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana.rojas@example.com");
    await user.selectOptions(screen.getByLabelText(/^rol$/i), "admin");
    await user.click(screen.getByRole("button", { name: /guardar usuario/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
  });
});
