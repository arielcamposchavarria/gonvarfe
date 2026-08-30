import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeactivateMarcaButton } from "./deactivate-marca-button";

describe("DeactivateMarcaButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no renderiza nada si la marca ya está inactiva", () => {
    const action = vi.fn();
    render(<DeactivateMarcaButton sitioId="sitio-1" marca={{ id: "marca-1", activo: false }} action={action} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pide confirmación y llama a la acción si se confirma", async () => {
    vi.stubGlobal("confirm", vi.fn(() => true));
    const action = vi.fn().mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<DeactivateMarcaButton sitioId="sitio-1" marca={{ id: "marca-1", activo: true }} action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledWith("sitio-1", "marca-1"));
  });

  it("no llama a la acción si el usuario cancela la confirmación", async () => {
    vi.stubGlobal("confirm", vi.fn(() => false));
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeactivateMarcaButton sitioId="sitio-1" marca={{ id: "marca-1", activo: true }} action={action} />);

    await user.click(screen.getByRole("button", { name: /desactivar/i }));

    expect(action).not.toHaveBeenCalled();
  });
});
