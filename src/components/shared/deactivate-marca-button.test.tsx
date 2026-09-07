import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeactivateMarcaButton } from "./deactivate-marca-button";

const { confirmActionMock, notifySuccessMock } = vi.hoisted(() => ({
  confirmActionMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/lib/confirm", () => ({
  confirmAction: confirmActionMock,
  notifySuccess: notifySuccessMock,
}));

describe("DeactivateMarcaButton", () => {
  beforeEach(() => {
    confirmActionMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("no renderiza nada si la marca ya está inactiva", () => {
    const action = vi.fn();
    render(<DeactivateMarcaButton sitioId="sitio-1" marca={{ id: "marca-1", activo: false }} action={action} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pide confirmación y llama a la acción si se confirma", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<DeactivateMarcaButton sitioId="sitio-1" marca={{ id: "marca-1", activo: true }} action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledWith("sitio-1", "marca-1"));
    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Marca desactivada"));
  });

  it("no llama a la acción si el usuario cancela la confirmación", async () => {
    confirmActionMock.mockResolvedValue(false);
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeactivateMarcaButton sitioId="sitio-1" marca={{ id: "marca-1", activo: true }} action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(action).not.toHaveBeenCalled();
  });
});
