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
});
