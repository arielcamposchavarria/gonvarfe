import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeactivateSiteButton } from "./deactivate-site-button";

const { confirmActionMock } = vi.hoisted(() => ({ confirmActionMock: vi.fn() }));

vi.mock("@/lib/confirm", () => ({
  confirmAction: confirmActionMock,
}));

describe("DeactivateSiteButton", () => {
  beforeEach(() => {
    confirmActionMock.mockReset();
  });

  it("no renderiza nada si el sitio ya está inactivo", () => {
    const action = vi.fn();
    render(<DeactivateSiteButton sitioId="sitio-1" activo={false} action={action} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pide confirmación y llama a la acción si se confirma", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<DeactivateSiteButton sitioId="sitio-1" activo action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledWith("sitio-1"));
  });

  it("no llama a la acción si el usuario cancela la confirmación", async () => {
    confirmActionMock.mockResolvedValue(false);
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeactivateSiteButton sitioId="sitio-1" activo action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(action).not.toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: "No se pudo desactivar." });
    const user = userEvent.setup();
    render(<DeactivateSiteButton sitioId="sitio-1" activo action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(await screen.findByText(/no se pudo desactivar/i)).toBeInTheDocument();
  });
});
