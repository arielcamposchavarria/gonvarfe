import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IncidentLogForm } from "./incident-log-form";

const { pushMock, notifySuccessMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/app/guard/logs/incident/actions", () => ({
  submitIncidentLogAction: vi.fn(async () => ({ error: null })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

describe("IncidentLogForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

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

  it("al guardar exitosamente, muestra un SweetAlert de éxito y navega al panel del guard", async () => {
    const user = userEvent.setup();
    render(<IncidentLogForm />);

    await user.selectOptions(screen.getByLabelText(/tipo de incidencia/i), "Accidente");
    await user.type(screen.getByLabelText(/local o zona/i), "Parqueo");
    await user.type(screen.getByLabelText(/descripción/i), "Se reporta un vehículo golpeado.");
    await user.click(screen.getByRole("button", { name: /guardar reporte/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Reporte de incidencia guardado"));
    expect(pushMock).toHaveBeenCalledWith("/guard/dashboard");
  });
});
