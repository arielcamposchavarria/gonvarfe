import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PhotosDialog } from "./photos-dialog";

describe("PhotosDialog", () => {
  it("no renderiza nada si no hay fotos", () => {
    const { container } = render(<PhotosDialog fotos={[]} title="Marca 1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el botón con la cantidad de fotos y las abre en un diálogo al hacer clic", async () => {
    const user = userEvent.setup();
    render(
      <PhotosDialog
        fotos={["data:image/png;base64,foto1", "data:image/png;base64,foto2"]}
        title="Marca 1"
        description="Escaneada a tiempo"
      />,
    );

    const button = screen.getByRole("button", { name: /ver fotos \(2\)/i });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(button);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Marca 1")).toBeInTheDocument();
    expect(screen.getByText("Escaneada a tiempo")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });
});
