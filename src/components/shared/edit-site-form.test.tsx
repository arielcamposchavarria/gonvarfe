import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditSiteForm } from "./edit-site-form";

const action = vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
  if (formData.get("name") === "Duplicado") {
    return { error: 'El sitio "Duplicado" ya existe.' };
  }
  return { error: null };
});

const SITIO = { id: "sitio-1", nombre: "Plaza Amara", direccion: "San José" };

describe("EditSiteForm", () => {
  it("abre el diálogo con los valores actuales precargados", async () => {
    const user = userEvent.setup();
    render(<EditSiteForm sitio={SITIO} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByLabelText(/nombre del sitio/i)).toHaveValue("Plaza Amara");
    expect(screen.getByLabelText(/dirección/i)).toHaveValue("San José");
  });

  it("muestra el error devuelto por la acción", async () => {
    const user = userEvent.setup();
    render(<EditSiteForm sitio={SITIO} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.clear(screen.getByLabelText(/nombre del sitio/i));
    await user.type(screen.getByLabelText(/nombre del sitio/i), "Duplicado");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
  });
});
