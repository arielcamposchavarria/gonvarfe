import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AssignGuardSiteForm } from "./assign-guard-site-form";

const { notifySuccessMock } = vi.hoisted(() => ({ notifySuccessMock: vi.fn() }));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const action = vi.fn(async (_guardId: string, siteId: string | null) => {
  if (siteId === "sitio-2") {
    return { error: 'Sitio con id "sitio-2" no fue encontrado' };
  }
  return { error: null };
});

const GUARD = { id: "guard-1", name: "Mario Solano", assignedSiteId: "sitio-1" };
const SITIOS = [
  { id: "sitio-1", nombre: "Plaza Amara" },
  { id: "sitio-2", nombre: "Plaza Test" },
];

describe("AssignGuardSiteForm", () => {
  beforeEach(() => {
    action.mockClear();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("abre el diálogo con el sitio asignado actual preseleccionado", async () => {
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={action} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));

    expect(screen.getByLabelText(/^sitio$/i)).toHaveValue("sitio-1");
  });

  it("permite elegir 'Sin sitio asignado' para desasignar, envía guardId y siteId directamente, y cierra el diálogo al guardar", async () => {
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={action} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));
    await user.selectOptions(screen.getByLabelText(/^sitio$/i), "");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledWith("guard-1", null));
    // El diálogo se cierra: el <select> ya no está en el documento.
    await waitFor(() => expect(screen.queryByLabelText(/^sitio$/i)).not.toBeInTheDocument());
    expect(notifySuccessMock).toHaveBeenCalled();
  });

  it("reasignar a otro sitio envía ese siteId", async () => {
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={action} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));
    await user.selectOptions(screen.getByLabelText(/^sitio$/i), "sitio-2");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledWith("guard-1", "sitio-2"));
  });

  it("muestra el error devuelto por la acción y mantiene el diálogo abierto, sin notificar éxito", async () => {
    const failingAction = vi.fn().mockResolvedValue({ error: 'Sitio con id "sitio-2" no fue encontrado' });
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={failingAction} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));
    await user.selectOptions(screen.getByLabelText(/^sitio$/i), "sitio-2");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no fue encontrado/i);
    expect(screen.getByLabelText(/^sitio$/i)).toBeInTheDocument();
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });
});
