import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MarcaTagInput } from "./marca-tag-input";

describe("MarcaTagInput", () => {
  it("agrega una marca al presionar Enter y limpia el campo de texto", async () => {
    const user = userEvent.setup();
    render(<MarcaTagInput name="visitingLocals" />);

    const input = screen.getByPlaceholderText(/escriba una marca/i);
    await user.type(input, "BAC{Enter}");

    expect(screen.getByText("BAC")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("agrega una marca al escribir una coma", async () => {
    const user = userEvent.setup();
    render(<MarcaTagInput name="visitingLocals" />);

    const input = screen.getByPlaceholderText(/escriba una marca/i);
    await user.type(input, "Burger King,");

    expect(screen.getByText("Burger King")).toBeInTheDocument();
  });

  it("no agrega marcas duplicadas", async () => {
    const user = userEvent.setup();
    render(<MarcaTagInput name="visitingLocals" />);

    const input = screen.getByPlaceholderText(/escriba una marca/i);
    await user.type(input, "BAC{Enter}");
    await user.type(input, "BAC{Enter}");

    expect(screen.getAllByText("BAC")).toHaveLength(1);
  });

  it("sincroniza cada marca en un input oculto con el name dado", async () => {
    const user = userEvent.setup();
    const { container } = render(<MarcaTagInput name="visitingLocals" />);

    const input = screen.getByPlaceholderText(/escriba una marca/i);
    await user.type(input, "BAC{Enter}");
    await user.type(input, "MEP{Enter}");

    const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="visitingLocals"]');
    expect(Array.from(hiddenInputs).map((el) => (el as HTMLInputElement).value)).toEqual(["BAC", "MEP"]);
  });

  it("quita una marca al hacer click en su botón X", async () => {
    const user = userEvent.setup();
    render(<MarcaTagInput name="visitingLocals" />);

    const input = screen.getByPlaceholderText(/escriba una marca/i);
    await user.type(input, "BAC{Enter}");
    expect(screen.getByText("BAC")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /quitar marca bac/i }));

    expect(screen.queryByText("BAC")).not.toBeInTheDocument();
  });
});
