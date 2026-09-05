import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { registrarSalidaActionMock, confirmActionMock, notifySuccessMock } = vi.hoisted(() => ({
  registrarSalidaActionMock: vi.fn(),
  confirmActionMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/app/guard/logs/entry/actions", () => ({
  registrarSalidaAction: registrarSalidaActionMock,
}));

vi.mock("@/lib/confirm", () => ({
  confirmAction: confirmActionMock,
  notifySuccess: notifySuccessMock,
}));

import { OpenEntryLogs } from "./open-entry-logs";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import type { EntryLog } from "@/domain/entities/entry-log";

function buildLog(overrides: Partial<EntryLog> = {}): EntryLog {
  return {
    id: "log-1",
    sitioId: "sitio-1",
    guardId: "guard-1",
    date: "2026-08-19",
    entryTime: "08:00",
    exitTime: null,
    plate: createPlateNumber("ABC123"),
    driverName: "Juan Pérez",
    cedula: createCedula("123456789"),
    company: "Acme",
    reason: "Entrega",
    visitingLocal: "BAC",
    observations: "",
    photoUrls: [],
    createdAt: new Date("2026-08-19T08:00:00Z"),
    ...overrides,
  };
}

describe("OpenEntryLogs", () => {
  beforeEach(() => {
    registrarSalidaActionMock.mockReset().mockResolvedValue({ error: null });
    confirmActionMock.mockReset().mockResolvedValue(true);
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("no renderiza nada si no hay ingresos abiertos", () => {
    const { container } = render(<OpenEntryLogs logs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el conductor y la hora de ingreso, y llama la acción al presionar Salida", async () => {
    const user = userEvent.setup();
    render(<OpenEntryLogs logs={[buildLog()]} />);

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /salida/i }));

    await waitFor(() => expect(registrarSalidaActionMock).toHaveBeenCalledWith("log-1"));
  });

  it("quita la fila de la lista y muestra un SweetAlert de éxito una vez registrada la salida sin error", async () => {
    const user = userEvent.setup();
    render(<OpenEntryLogs logs={[buildLog()]} />);

    await user.click(screen.getByRole("button", { name: /salida/i }));

    await waitFor(() => expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument());
    expect(notifySuccessMock).toHaveBeenCalledWith("Salida registrada");
  });

  it("si la acción falla, muestra el error y mantiene la fila", async () => {
    registrarSalidaActionMock.mockResolvedValue({ error: "Esta entrada ya tiene salida registrada." });
    const user = userEvent.setup();
    render(<OpenEntryLogs logs={[buildLog()]} />);

    await user.click(screen.getByRole("button", { name: /salida/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya tiene salida registrada/i);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("pide confirmación antes de registrar la salida, y no llama la acción si se cancela", async () => {
    confirmActionMock.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<OpenEntryLogs logs={[buildLog()]} />);

    await user.click(screen.getByRole("button", { name: /salida/i }));

    expect(registrarSalidaActionMock).not.toHaveBeenCalled();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });
});
