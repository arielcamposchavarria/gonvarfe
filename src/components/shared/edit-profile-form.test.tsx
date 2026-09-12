import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditProfileForm, type EditProfileFormState } from "./edit-profile-form";
import type { AppUser } from "@/domain/entities/user";

const { notifySuccessMock } = vi.hoisted(() => ({
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const USER: AppUser = {
  id: "user-1",
  name: "Juan Pérez",
  username: "jperez",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
};

describe("EditProfileForm", () => {
  beforeEach(() => {
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("prellena el nombre actual del usuario", () => {
    const action = vi.fn(async (): Promise<EditProfileFormState> => ({ error: null }));
    render(<EditProfileForm user={USER} action={action} />);

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue("Juan Pérez");
  });

  it("no muestra campos de usuario, correo ni rol (no son editables aquí)", () => {
    const action = vi.fn(async (): Promise<EditProfileFormState> => ({ error: null }));
    render(<EditProfileForm user={USER} action={action} />);

    expect(screen.queryByLabelText(/^usuario$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/correo/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^rol$/i)).not.toBeInTheDocument();
  });

  it("al guardar exitosamente, notifica éxito", async () => {
    const action = vi.fn(async (): Promise<EditProfileFormState> => ({ error: null }));
    const user = userEvent.setup();
    render(<EditProfileForm user={USER} action={action} />);

    await user.clear(screen.getByLabelText(/nombre completo/i));
    await user.type(screen.getByLabelText(/nombre completo/i), "Juan Pérez Nuevo");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() =>
      expect(notifySuccessMock).toHaveBeenCalledWith("Perfil actualizado", "Tus datos se guardaron correctamente."),
    );
  });

  it("muestra el error devuelto por la acción", async () => {
    const action = vi.fn(async (): Promise<EditProfileFormState> => ({ error: "El nombre del usuario no puede estar vacio" }));
    const user = userEvent.setup();
    render(<EditProfileForm user={USER} action={action} />);

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no puede estar vacio/i);
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });
});
