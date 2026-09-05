import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateSiteForm } from "./create-site-form";

const { pushMock, notifySuccessMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  notifySuccessMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/confirm", () => ({
  notifySuccess: notifySuccessMock,
}));

const action = vi.fn(async (_prevState: { error: string | null }, formData: FormData) => {
  if (formData.get("name") === "Plaza Amara") {
    return { error: 'El sitio "Plaza Amara" ya existe.' };
  }
  return { error: null };
});

describe("CreateSiteForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
  });

  it("muestra los campos del formulario", () => {
    render(<CreateSiteForm action={action} backHref="/superadmin/sites" />);

    expect(screen.getByLabelText(/nombre del sitio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/marcas/i)).toBeInTheDocument();
  });

  it("muestra el error devuelto por la acción", async () => {
    const user = userEvent.setup();
    render(<CreateSiteForm action={action} backHref="/superadmin/sites" />);

    await user.type(screen.getByLabelText(/nombre del sitio/i), "Plaza Amara");
    await user.type(screen.getByLabelText(/dirección/i), "San José");
    await user.click(screen.getByRole("button", { name: /guardar sitio/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya existe/i);
    expect(notifySuccessMock).not.toHaveBeenCalled();
  });

  it("al guardar exitosamente, muestra un SweetAlert de éxito y luego navega a backHref", async () => {
    const user = userEvent.setup();
    render(<CreateSiteForm action={action} backHref="/superadmin/sites" />);

    await user.type(screen.getByLabelText(/nombre del sitio/i), "Plaza Nueva");
    await user.type(screen.getByLabelText(/dirección/i), "Liberia");
    await user.click(screen.getByRole("button", { name: /guardar sitio/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Sitio creado"));
    expect(pushMock).toHaveBeenCalledWith("/superadmin/sites");
  });
});
