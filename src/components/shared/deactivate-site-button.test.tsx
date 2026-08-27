import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeactivateSiteButton } from "./deactivate-site-button";

describe("DeactivateSiteButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no renderiza nada si el sitio ya está inactivo", () => {
    const action = vi.fn();
    render(<DeactivateSiteButton sitioId="sitio-1" activo={false} action={action} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pide confirmación y llama a la acción si se confirma", async () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    const action = vi.fn().mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<DeactivateSiteButton sitioId="sitio-1" activo action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledWith("sitio-1"));
  });

  it("no llama a la acción si el usuario cancela la confirmación", async () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeactivateSiteButton sitioId="sitio-1" activo action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(action).not.toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    const action = vi.fn().mockResolvedValue({ error: "No se pudo desactivar." });
    const user = userEvent.setup();
    render(<DeactivateSiteButton sitioId="sitio-1" activo action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(await screen.findByText(/no se pudo desactivar/i)).toBeInTheDocument();
  });
});
