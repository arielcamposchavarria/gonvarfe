import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecoverAccountForm } from "./recover-account-form";

const requestRecoveryCodeAction = vi.fn();
const verifyRecoveryCodeAction = vi.fn();
const resetPasswordWithCodeAction = vi.fn();

vi.mock("@/app/login/recover/actions", () => ({
  requestRecoveryCodeAction: (...args: unknown[]) => requestRecoveryCodeAction(...args),
  verifyRecoveryCodeAction: (...args: unknown[]) => verifyRecoveryCodeAction(...args),
  resetPasswordWithCodeAction: (...args: unknown[]) => resetPasswordWithCodeAction(...args),
}));

describe("RecoverAccountForm", () => {
  it("recupera el usuario: elegir, email, código, y muestra el username", async () => {
    requestRecoveryCodeAction.mockResolvedValue({ ok: true });
    verifyRecoveryCodeAction.mockResolvedValue({ ok: true, type: "username", username: "jperez" });

    const user = userEvent.setup();
    render(<RecoverAccountForm />);

    await user.click(screen.getByRole("button", { name: /olvidé mi usuario/i }));
    await user.type(screen.getByLabelText(/correo electrónico/i), "jperez@example.com");
    await user.click(screen.getByRole("button", { name: /enviar código/i }));

    expect(await screen.findByLabelText(/código de 4 dígitos/i)).toBeInTheDocument();
    expect(requestRecoveryCodeAction).toHaveBeenCalledWith("jperez@example.com", "username");

    await user.type(screen.getByLabelText(/código de 4 dígitos/i), "1234");
    await user.click(screen.getByRole("button", { name: /verificar código/i }));

    expect(verifyRecoveryCodeAction).toHaveBeenCalledWith("jperez@example.com", "1234", "username");
    expect(await screen.findByText("jperez")).toBeInTheDocument();
  });

  it("recupera la contraseña: elegir, email, código, nueva contraseña", async () => {
    requestRecoveryCodeAction.mockResolvedValue({ ok: true });
    verifyRecoveryCodeAction.mockResolvedValue({ ok: true, type: "password" });
    resetPasswordWithCodeAction.mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    render(<RecoverAccountForm />);

    await user.click(screen.getByRole("button", { name: /olvidé mi contraseña/i }));
    await user.type(screen.getByLabelText(/correo electrónico/i), "jperez@example.com");
    await user.click(screen.getByRole("button", { name: /enviar código/i }));

    await user.type(await screen.findByLabelText(/código de 4 dígitos/i), "1234");
    await user.click(screen.getByRole("button", { name: /verificar código/i }));

    expect(await screen.findByLabelText(/^nueva contraseña$/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^nueva contraseña$/i), "clave-nueva");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "clave-nueva");
    await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(resetPasswordWithCodeAction).toHaveBeenCalledWith(
      "jperez@example.com",
      "1234",
      "clave-nueva",
      "clave-nueva",
    );
    expect(await screen.findByText(/contraseña fue actualizada/i)).toBeInTheDocument();
  });

  it("muestra un error inline cuando el código es inválido", async () => {
    requestRecoveryCodeAction.mockResolvedValue({ ok: true });
    verifyRecoveryCodeAction.mockResolvedValue({ ok: false, error: "Código inválido o expirado." });

    const user = userEvent.setup();
    render(<RecoverAccountForm />);

    await user.click(screen.getByRole("button", { name: /olvidé mi contraseña/i }));
    await user.type(screen.getByLabelText(/correo electrónico/i), "jperez@example.com");
    await user.click(screen.getByRole("button", { name: /enviar código/i }));

    await user.type(await screen.findByLabelText(/código de 4 dígitos/i), "0000");
    await user.click(screen.getByRole("button", { name: /verificar código/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/código inválido/i);
  });
});
