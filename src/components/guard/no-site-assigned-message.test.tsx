import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { NoSiteAssignedMessage } from "./no-site-assigned-message";

describe("NoSiteAssignedMessage", () => {
  it("pide contactar al administrador cuando nunca se asignó un sitio", () => {
    render(<NoSiteAssignedMessage />);

    expect(screen.getByText(/todavía no tienes un sitio asignado/i)).toBeInTheDocument();
  });

  it("indica que el sitio asignado ya no está disponible", () => {
    render(<NoSiteAssignedMessage variant="unavailable" />);

    expect(screen.getByText(/ya no está disponible/i)).toBeInTheDocument();
  });
});
