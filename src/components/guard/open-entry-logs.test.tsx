import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

const { registrarSalidaActionMock } = vi.hoisted(() => ({
  registrarSalidaActionMock: vi.fn(),
}));

vi.mock("@/app/guard/logs/entry/actions", () => ({
  registrarSalidaAction: registrarSalidaActionMock,
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

  it("quita la fila de la lista una vez registrada la salida sin error", async () => {
    const user = userEvent.setup();
    render(<OpenEntryLogs logs={[buildLog()]} />);

    await user.click(screen.getByRole("button", { name: /salida/i }));

    await waitFor(() => expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument());
  });

  it("si la acción falla, muestra el error y mantiene la fila", async () => {
    registrarSalidaActionMock.mockResolvedValue({ error: "Esta entrada ya tiene salida registrada." });
    const user = userEvent.setup();
    render(<OpenEntryLogs logs={[buildLog()]} />);

    await user.click(screen.getByRole("button", { name: /salida/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya tiene salida registrada/i);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });
});
