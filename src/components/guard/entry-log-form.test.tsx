import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EntryLogForm } from "./entry-log-form";

vi.mock("@/app/guard/logs/entry/actions", () => ({
  submitEntryLogAction: vi.fn(async () => ({ error: null })),
}));

const VISITING_LOCALS = ["BANCO BAC SAN JOSE SA", "MEP", "Otro"];

describe("EntryLogForm", () => {
  it("no muestra el campo de detalle por defecto", () => {
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    expect(screen.queryByLabelText(/especifique el local/i)).not.toBeInTheDocument();
  });

  it("muestra el campo de detalle al seleccionar Otro como local", async () => {
    const user = userEvent.setup();
    render(<EntryLogForm visitingLocals={VISITING_LOCALS} />);

    await user.selectOptions(screen.getByLabelText(/local que visita/i), "Otro");

    expect(screen.getByLabelText(/especifique el local/i)).toBeInTheDocument();
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
