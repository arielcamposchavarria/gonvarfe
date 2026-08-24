import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DateRangeFilter } from "./date-range-filter";

describe("DateRangeFilter", () => {
  it("envía el filtro vía GET a la misma página", () => {
    render(<DateRangeFilter />);

    const form = screen.getByLabelText(/desde/i).closest("form");
    expect(form).toHaveAttribute("method", "GET");
  });

  it("precarga los valores actuales de desde/hasta", () => {
    render(<DateRangeFilter from="2026-01-01" to="2026-01-31" />);

    expect(screen.getByLabelText(/desde/i)).toHaveValue("2026-01-01");
    expect(screen.getByLabelText(/hasta/i)).toHaveValue("2026-01-31");
  });

  it("no muestra el botón Limpiar cuando no hay filtro activo", () => {
    render(<DateRangeFilter />);

    expect(screen.queryByRole("link", { name: /limpiar/i })).not.toBeInTheDocument();
  });

  it("muestra el botón Limpiar cuando hay un filtro activo", () => {
    render(<DateRangeFilter from="2026-01-01" />);

    expect(screen.getByRole("link", { name: /limpiar/i })).toBeInTheDocument();
  });
});
