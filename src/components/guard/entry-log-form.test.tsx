import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EntryLogForm } from "./entry-log-form";

vi.mock("@/app/guard/logs/entry/actions", () => ({
  submitEntryLogAction: vi.fn(async () => ({ error: null })),
}));

const VISITING_LOCALS = ["BANCO BAC SAN JOSE SA", "MEP"];

describe("EntryLogForm", () => {
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
});
