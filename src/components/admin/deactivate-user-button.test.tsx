import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeactivateUserButton } from "./deactivate-user-button";

const { confirmActionMock, notifySuccessMock } = vi.hoisted(() => ({
  confirmActionMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/lib/confirm", () => ({
  confirmAction: confirmActionMock,
  notifySuccess: notifySuccessMock,
}));

describe("DeactivateUserButton", () => {
  beforeEach(() => {
    confirmActionMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("no renderiza nada si el usuario ya está inactivo", () => {
    const action = vi.fn();
    render(<DeactivateUserButton userId="user-1" userName="Juan Pérez" isActive={false} action={action} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pide confirmación mencionando el nombre del usuario, y llama a la acción si se confirma", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<DeactivateUserButton userId="user-1" userName="Juan Pérez" isActive action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(confirmActionMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining("Juan Pérez") }),
    );
    await waitFor(() => expect(action).toHaveBeenCalledWith("user-1"));
    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Usuario desactivado"));
  });

  it("no llama a la acción si se cancela la confirmación", async () => {
    confirmActionMock.mockResolvedValue(false);
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeactivateUserButton userId="user-1" userName="Juan Pérez" isActive action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(action).not.toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción (ej. intentar desactivarse a sí mismo)", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: "No puede desactivar su propia cuenta" });
    const user = userEvent.setup();
    render(<DeactivateUserButton userId="user-1" userName="Juan Pérez" isActive action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(await screen.findByText(/no puede desactivar su propia cuenta/i)).toBeInTheDocument();
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });
});
