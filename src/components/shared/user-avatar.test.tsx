import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { UserAvatar } from "./user-avatar";

describe("UserAvatar", () => {
  it("muestra las iniciales cuando no hay foto", () => {
    render(<UserAvatar name="Mario Solano" photoUrl={null} />);

    expect(screen.getByLabelText(/foto de perfil no asignada/i)).toHaveTextContent("MS");
    expect(screen.queryByAltText(/foto de perfil/i)).not.toBeInTheDocument();
  });

  it("muestra la foto cuando existe", () => {
    render(<UserAvatar name="Mario Solano" photoUrl="data:image/png;base64,foto1" />);

    expect(screen.getByAltText(/foto de perfil/i)).toHaveAttribute("src", "data:image/png;base64,foto1");
  });

  it("usa las dos primeras palabras del nombre para las iniciales", () => {
    render(<UserAvatar name="Ana María Rojas" photoUrl={null} />);

    expect(screen.getByLabelText(/foto de perfil no asignada/i)).toHaveTextContent("AM");
  });
});
