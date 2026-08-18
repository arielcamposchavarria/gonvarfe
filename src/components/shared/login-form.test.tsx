import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "./login-form";

vi.mock("@/app/login/actions", () => ({
  loginAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("username") === "usuario-invalido") {
      return { error: "Usuario o contraseña inválidos." };
    }
    return { error: null };
  }),
}));

describe("LoginForm", () => {
  it("muestra los campos de usuario y contraseña", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });

  it("muestra el error devuelto por la acción de login", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/usuario/i), "usuario-invalido");
    await user.type(screen.getByLabelText(/contraseña/i), "whatever");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/inválidos/i);
  });
});
