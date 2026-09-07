import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { reportarPerdidoActionMock } = vi.hoisted(() => ({
  reportarPerdidoActionMock: vi.fn(),
}));

vi.mock("@/app/guard/actions", () => ({
  reportarPerdidoAction: reportarPerdidoActionMock,
}));

import { ReportMissedDialog } from "./report-missed-dialog";

describe("ReportMissedDialog", () => {
  beforeEach(() => {
    reportarPerdidoActionMock.mockReset().mockResolvedValue({ error: null });
  });

  it("envía el motivo, y llama onSubmitted(null) cuando la acción no falla", async () => {
    const onSubmitted = vi.fn();
    const user = userEvent.setup();
    render(<ReportMissedDialog open onClose={vi.fn()} onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/motivo/i), "La cámara del pasillo no encendió");
    await user.click(screen.getByRole("button", { name: /reportar/i }));

    await waitFor(() =>
      expect(reportarPerdidoActionMock).toHaveBeenCalledWith(
        expect.objectContaining({ motivo: "La cámara del pasillo no encendió", fotos: [] }),
      ),
    );
    expect(onSubmitted).toHaveBeenCalledWith(null);
  });

  it("si la acción devuelve error, llama onSubmitted con ese mensaje", async () => {
    reportarPerdidoActionMock.mockResolvedValue({ error: "No hay un turno activo." });
    const onSubmitted = vi.fn();
    const user = userEvent.setup();
    render(<ReportMissedDialog open onClose={vi.fn()} onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/motivo/i), "Puerta bloqueada");
    await user.click(screen.getByRole("button", { name: /reportar/i }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith("No hay un turno activo."));
  });

  it("con target, muestra el nombre de la marca en el título y envía recorridoId/registroId", async () => {
    const onSubmitted = vi.fn();
    const user = userEvent.setup();
    render(
      <ReportMissedDialog
        open
        onClose={vi.fn()}
        onSubmitted={onSubmitted}
        target={{ recorridoId: "recorrido-viejo", registroId: "registro-3", marcaNombre: "Área de carga" }}
      />,
    );

    expect(screen.getByText(/no pude escanear: área de carga/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/motivo/i), "Se cortó el turno antes de llegar");
    await user.click(screen.getByRole("button", { name: /reportar/i }));

    await waitFor(() =>
      expect(reportarPerdidoActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          motivo: "Se cortó el turno antes de llegar",
          recorridoId: "recorrido-viejo",
          registroId: "registro-3",
        }),
      ),
    );
  });

  it("sin target, no envía recorridoId ni registroId", async () => {
    const onSubmitted = vi.fn();
    const user = userEvent.setup();
    render(<ReportMissedDialog open onClose={vi.fn()} onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/motivo/i), "Cámara descompuesta");
    await user.click(screen.getByRole("button", { name: /reportar/i }));

    await waitFor(() => expect(reportarPerdidoActionMock).toHaveBeenCalled());
    const call = reportarPerdidoActionMock.mock.calls[0][0];
    expect(call.recorridoId).toBeUndefined();
    expect(call.registroId).toBeUndefined();
  });
});
