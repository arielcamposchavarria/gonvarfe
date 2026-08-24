import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateSiteForm } from "./create-site-form";

vi.mock("@/app/superadmin/sites/actions", () => ({
  createSiteAction: vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
    if (formData.get("name") === "Plaza Amara") {
      return { error: 'El sitio "Plaza Amara" ya existe.' };
    }
    return { error: null };
  }),
}));

describe("CreateSiteForm", () => {
  it("muestra los campos del formulario", () => {
    render(<CreateSiteForm />);

    expect(screen.getByLabelText(/nombre del sitio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/marcas\/locales/i)).toBeInTheDocument();
  });

  it("muestra el error devuelto por la acción", async () => {
    const user = userEvent.setup();
    render(<CreateSiteForm />);

    await user.type(screen.getByLabelText(/nombre del sitio/i), "Plaza Amara");
    await user.type(screen.getByLabelText(/dirección/i), "San José");
    await user.click(screen.getByRole("button", { name: /guardar sitio/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
  });
});
