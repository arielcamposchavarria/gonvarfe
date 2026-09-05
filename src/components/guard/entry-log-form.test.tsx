import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EntryLogForm } from "./entry-log-form";

const { pushMock, notifySuccessMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/app/guard/logs/entry/actions", () => ({
  submitEntryLogAction: vi.fn(async () => ({ error: null })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const VISITING_LOCALS = ["BANCO BAC SAN JOSE SA", "MEP"];

describe("EntryLogForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("no muestra el campo de detalle por defecto", () => {
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    expect(screen.queryByLabelText(/especifique el local/i)).not.toBeInTheDocument();
  });

  it("ofrece 'Otro' para escribir el local a mano, aunque no venga en la lista del sitio", () => {
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    expect(screen.getByRole("option", { name: "Otro" })).toBeInTheDocument();
  });

  it("el local que visita no es obligatorio para enviar el formulario", () => {
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    expect(screen.getByLabelText(/local que visita/i)).not.toBeRequired();
  });

  it("muestra el campo de detalle al seleccionar Otro como local", async () => {
    const user = userEvent.setup();
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    await user.selectOptions(screen.getByLabelText(/local que visita/i), "Otro");

    expect(screen.getByLabelText(/especifique el local/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/especifique el local/i)).not.toBeRequired();
  });

  it("oculta el campo de detalle al elegir un local de la lista", async () => {
    const user = userEvent.setup();
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    await user.selectOptions(screen.getByLabelText(/local que visita/i), "Otro");
    expect(screen.getByLabelText(/especifique el local/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/local que visita/i), "MEP");
    expect(screen.queryByLabelText(/especifique el local/i)).not.toBeInTheDocument();
  });

  it("al guardar exitosamente, muestra un SweetAlert de éxito y navega al panel del guard", async () => {
    const user = userEvent.setup();
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    await user.type(screen.getByLabelText(/placa/i), "ABC123");
    await user.type(screen.getByLabelText(/conductor/i), "Juan Pérez");
    await user.type(screen.getByLabelText(/cédula/i), "123456789");
    await user.type(screen.getByLabelText(/empresa/i), "Acme S.A.");
    await user.type(screen.getByLabelText(/motivo/i), "Entrega");
    await user.click(screen.getByRole("button", { name: /guardar registro/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Registro de ingreso guardado"));
    expect(pushMock).toHaveBeenCalledWith("/guard/dashboard");
  });
});
