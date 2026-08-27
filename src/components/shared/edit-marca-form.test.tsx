import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditMarcaForm } from "./edit-marca-form";

const action = vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
  if (formData.get("name") === "Duplicada") {
    return { error: 'Ya existe una marca "Duplicada".' };
  }
  return { error: null };
});

const MARCA = { id: "marca-1", nombre: "BAC" };

describe("EditMarcaForm", () => {
  it("abre el diálogo con el nombre actual precargado", async () => {
    const user = userEvent.setup();
    render(<EditMarcaForm sitioId="sitio-1" marca={MARCA} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByLabelText(/nombre de la marca/i)).toHaveValue("BAC");
  });

  it("muestra el error devuelto por la acción", async () => {
    const user = userEvent.setup();
    render(<EditMarcaForm sitioId="sitio-1" marca={MARCA} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.clear(screen.getByLabelText(/nombre de la marca/i));
    await user.type(screen.getByLabelText(/nombre de la marca/i), "Duplicada");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
  });
});
