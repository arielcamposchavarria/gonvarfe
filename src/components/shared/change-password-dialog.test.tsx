import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChangePasswordDialog, type ChangePasswordActionResult } from "./change-password-dialog";

const { notifySuccessMock } = vi.hoisted(() => ({
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

describe("ChangePasswordDialog", () => {
  beforeEach(() => {
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("abre el diálogo y envía currentPassword/newPassword a la acción", async () => {
    const action = vi.fn(async (): Promise<ChangePasswordActionResult> => ({ error: null }));
    const user = userEvent.setup();
    render(<ChangePasswordDialog action={action} />);

    await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
    await user.type(screen.getByLabelText(/contraseña actual/i), "actual123");
    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "nueva1234");
    await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), "nueva1234");
    await user.click(screen.getByRole("button", { name: /^cambiar contraseña$/i }));

    await waitFor(() =>
      expect(action).toHaveBeenCalledWith({ currentPassword: "actual123", newPassword: "nueva1234" }),
    );
    await waitFor(() =>
      expect(notifySuccessMock).toHaveBeenCalledWith("Contraseña actualizada", "Tu contraseña se cambió correctamente."),
    );
  });

  it("valida en el cliente que la confirmación coincida, sin llamar la acción", async () => {
    const action = vi.fn(async (): Promise<ChangePasswordActionResult> => ({ error: null }));
    const user = userEvent.setup();
    render(<ChangePasswordDialog action={action} />);

    await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
    await user.type(screen.getByLabelText(/contraseña actual/i), "actual123");
    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "nueva1234");
    await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), "otra-cosa");
    await user.click(screen.getByRole("button", { name: /^cambiar contraseña$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no coinciden/i);
    expect(action).not.toHaveBeenCalled();
  });

  it("muestra el error de la acción (p. ej. contraseña actual incorrecta)", async () => {
    const action = vi.fn(async (): Promise<ChangePasswordActionResult> => ({ error: "La contraseña actual no es correcta." }));
    const user = userEvent.setup();
    render(<ChangePasswordDialog action={action} />);

    await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
    await user.type(screen.getByLabelText(/contraseña actual/i), "mala");
    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "nueva1234");
    await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), "nueva1234");
    await user.click(screen.getByRole("button", { name: /^cambiar contraseña$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no es correcta/i);
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });
});
