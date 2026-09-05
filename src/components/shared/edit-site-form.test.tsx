import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditSiteForm } from "./edit-site-form";

const { notifySuccessMock } = vi.hoisted(() => ({ notifySuccessMock: vi.fn() }));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const action = vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
  if (formData.get("name") === "Duplicado") {
    return { error: 'El sitio "Duplicado" ya existe.' };
  }
  return { error: null };
});

const SITIO = { id: "sitio-1", nombre: "Plaza Amara", direccion: "San José" };

describe("EditSiteForm", () => {
  beforeEach(() => {
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("abre el diálogo con los valores actuales precargados", async () => {
    const user = userEvent.setup();
    render(<EditSiteForm sitio={SITIO} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByLabelText(/nombre del sitio/i)).toHaveValue("Plaza Amara");
    expect(screen.getByLabelText(/dirección/i)).toHaveValue("San José");
  });

  it("muestra el error devuelto por la acción y no cierra el diálogo", async () => {
    const user = userEvent.setup();
    render(<EditSiteForm sitio={SITIO} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.clear(screen.getByLabelText(/nombre del sitio/i));
    await user.type(screen.getByLabelText(/nombre del sitio/i), "Duplicado");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("al guardar exitosamente, muestra un SweetAlert de éxito y cierra el diálogo", async () => {
    const user = userEvent.setup();
    render(<EditSiteForm sitio={SITIO} action={action} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Sitio actualizado"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
