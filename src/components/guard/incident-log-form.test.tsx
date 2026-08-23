import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IncidentLogForm } from "./incident-log-form";

vi.mock("@/app/guard/logs/incident/actions", () => ({
  submitIncidentLogAction: vi.fn(async () => ({ error: null })),
}));

describe("IncidentLogForm", () => {
  it("no muestra el campo de detalle por defecto", () => {
    render(<IncidentLogForm />);

    expect(screen.queryByLabelText(/especifique la incidencia/i)).not.toBeInTheDocument();
  });

  it("muestra el campo de detalle al seleccionar el tipo Otro", async () => {
    const user = userEvent.setup();
    render(<IncidentLogForm />);

    await user.selectOptions(screen.getByLabelText(/tipo de incidencia/i), "Otro");

    expect(screen.getByLabelText(/especifique la incidencia/i)).toBeInTheDocument();
  });

  it("oculta el campo de detalle al cambiar a otro tipo distinto de Otro", async () => {
    const user = userEvent.setup();
    render(<IncidentLogForm />);

    await user.selectOptions(screen.getByLabelText(/tipo de incidencia/i), "Otro");
    expect(screen.getByLabelText(/especifique la incidencia/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/tipo de incidencia/i), "Accidente");
    expect(screen.queryByLabelText(/especifique la incidencia/i)).not.toBeInTheDocument();
  });
});
