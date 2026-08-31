import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AssignGuardSiteForm } from "./assign-guard-site-form";

const action = vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
  if (formData.get("siteId") === "sitio-2") {
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
  });

  it("abre el diálogo con el sitio asignado actual preseleccionado", async () => {
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={action} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));

    expect(screen.getByLabelText(/^sitio$/i)).toHaveValue("sitio-1");
  });

  it("permite elegir 'Sin sitio asignado' para desasignar", async () => {
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={action} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));
    await user.selectOptions(screen.getByLabelText(/^sitio$/i), "");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(action).toHaveBeenCalled();
  });

  it("muestra el error devuelto por la acción", async () => {
    const user = userEvent.setup();
    render(<AssignGuardSiteForm guard={GUARD} sitios={SITIOS} action={action} />);

    await user.click(screen.getByRole("button", { name: /asignar sitio/i }));
    await user.selectOptions(screen.getByLabelText(/^sitio$/i), "sitio-2");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no fue encontrado/i);
  });
});
