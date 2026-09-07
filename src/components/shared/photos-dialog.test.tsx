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

  it("al tocar una foto del grid, la agranda a pantalla completa, y 'Volver' regresa al grid", async () => {
    const user = userEvent.setup();
    render(
      <PhotosDialog fotos={["data:image/png;base64,foto1", "data:image/png;base64,foto2"]} title="Marca 1" />,
    );

    await user.click(screen.getByRole("button", { name: /ver fotos \(2\)/i }));
    await user.click(screen.getByRole("button", { name: /agrandar foto 2/i }));

    const enlarged = screen.getByRole("img", { name: /foto 2/i });
    expect(enlarged).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /volver/i }));

    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("al cerrar el diálogo estando en la vista agrandada, reinicia al grid la próxima vez que se abre", async () => {
    const user = userEvent.setup();
    render(<PhotosDialog fotos={["data:image/png;base64,foto1"]} title="Marca 1" />);

    await user.click(screen.getByRole("button", { name: /ver fotos \(1\)/i }));
    await user.click(screen.getByRole("button", { name: /agrandar foto 1/i }));
    expect(screen.queryByRole("button", { name: /volver/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /ver fotos \(1\)/i }));

    expect(screen.queryByRole("button", { name: /volver/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
