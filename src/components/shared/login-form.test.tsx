import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "./login-form";

const { pushMock, notifySuccessMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/app/login/actions", () => ({
  loginAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("username") === "usuario-invalido") {
      return { error: "Usuario o contraseña inválidos.", redirectTo: null };
    }
    return { error: null, redirectTo: "/admin/dashboard" };
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

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
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("al iniciar sesión exitosamente, muestra un SweetAlert de bienvenida y navega al destino indicado", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/usuario/i), "admin");
    await user.type(screen.getByLabelText(/contraseña/i), "1234");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Bienvenido"));
    expect(pushMock).toHaveBeenCalledWith("/admin/dashboard");
  });
});
