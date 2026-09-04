import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ForceFinalizeTurnoButton } from "./force-finalize-turno-button";

const { confirmActionMock } = vi.hoisted(() => ({ confirmActionMock: vi.fn() }));

vi.mock("@/lib/confirm", () => ({
  confirmAction: confirmActionMock,
}));

describe("ForceFinalizeTurnoButton", () => {
  beforeEach(() => {
    confirmActionMock.mockReset();
  });

  it("pide confirmación y llama a la acción con el sitio y el turno si se confirma", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(
      <ForceFinalizeTurnoButton siteId="site-1" turnoId="turno-1" guardName="Ana Pérez" action={action} />,
    );

    await user.click(screen.getByRole("button", { name: /finalizar turno/i }));

    expect(confirmActionMock).toHaveBeenCalledWith(
      expect.objectContaining({ variant: "destructive" }),
    );
    await waitFor(() => expect(action).toHaveBeenCalledWith("site-1", "turno-1"));
  });

  it("no llama a la acción si el admin cancela la confirmación", async () => {
    confirmActionMock.mockResolvedValue(false);
    const action = vi.fn();
    const user = userEvent.setup();
    render(
      <ForceFinalizeTurnoButton siteId="site-1" turnoId="turno-1" guardName="Ana Pérez" action={action} />,
    );

    await user.click(screen.getByRole("button", { name: /finalizar turno/i }));

    expect(action).not.toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción", async () => {
    confirmActionMock.mockResolvedValue(true);
    const action = vi.fn().mockResolvedValue({ error: "Este turno ya está finalizado." });
    const user = userEvent.setup();
    render(
      <ForceFinalizeTurnoButton siteId="site-1" turnoId="turno-1" guardName="Ana Pérez" action={action} />,
    );

    await user.click(screen.getByRole("button", { name: /finalizar turno/i }));

    expect(await screen.findByText(/ya está finalizado/i)).toBeInTheDocument();
  });
});
