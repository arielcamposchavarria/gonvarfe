import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateUserForm } from "./create-user-form";

const { pushMock, notifySuccessMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/app/superadmin/dashboard/new/actions", () => ({
  createUserAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("username") === "existente") {
      return { error: 'El usuario "existente" ya existe.' };
    }
    return { error: null };
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const ROLES = [
  { id: "role-1", name: "superAdmin" },
  { id: "role-2", name: "admin" },
  { id: "role-3", name: "guard" },
];

describe("CreateUserForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("muestra los campos del formulario y los roles disponibles, sin selector de sitio ni de contraseña", () => {
    render(<CreateUserForm roles={ROLES} />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^rol$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/sitio asignado/i)).not.toBeInTheDocument();
  });

  it("no muestra un selector de sitio ni siquiera al elegir el rol guard", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm roles={ROLES} />);

    await user.selectOptions(screen.getByLabelText(/^rol$/i), "guard");
    expect(screen.queryByLabelText(/sitio asignado/i)).not.toBeInTheDocument();
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
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("al crear exitosamente, muestra un SweetAlert de éxito y navega a /superadmin/dashboard", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm roles={ROLES} />);

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana Rojas");
    await user.type(screen.getByLabelText(/usuario/i), "ana-rojas");
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana.rojas@example.com");
    await user.selectOptions(screen.getByLabelText(/^rol$/i), "admin");
    await user.click(screen.getByRole("button", { name: /guardar usuario/i }));

    await waitFor(() =>
      expect(notifySuccessMock).toHaveBeenCalledWith(
        "Usuario creado",
        "Se envió una contraseña temporal al correo ingresado.",
      ),
    );
    expect(pushMock).toHaveBeenCalledWith("/superadmin/dashboard");
  });
});
