import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const iniciarTurnoAction = vi.fn();
const push = vi.fn();

vi.mock("@/app/guard/actions", () => ({
  iniciarTurnoAction: (...args: unknown[]) => iniciarTurnoAction(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { SelectSiteForm } from "./select-site-form";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

const SITIO: GuardSitio = {
  id: "sitio-1",
  nombre: "Plaza Amara",
  direccion: "San José",
  marcas: [],
  locales: [],
};

describe("SelectSiteForm", () => {
  beforeEach(() => {
    iniciarTurnoAction.mockReset();
    push.mockReset();
  });

  it("muestra únicamente el sitio asignado por el admin", () => {
    render(<SelectSiteForm sitio={SITIO} />);

    expect(screen.getByText("Plaza Amara")).toBeInTheDocument();
    expect(screen.getByText("San José")).toBeInTheDocument();
  });

  it("inicia turno en el sitio asignado y navega al dashboard", async () => {
    iniciarTurnoAction.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SelectSiteForm sitio={SITIO} />);

    await user.click(screen.getByRole("button", { name: /plaza amara/i }));

    expect(iniciarTurnoAction).toHaveBeenCalledWith("sitio-1");
    expect(push).toHaveBeenCalledWith("/guard/dashboard");
  });

  it("muestra el error devuelto por la acción sin navegar", async () => {
    iniciarTurnoAction.mockResolvedValue({ error: "El sitio está inactivo." });
    const user = userEvent.setup();
    render(<SelectSiteForm sitio={SITIO} />);

    await user.click(screen.getByRole("button", { name: /plaza amara/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/inactivo/i);
    expect(push).not.toHaveBeenCalled();
  });
});
