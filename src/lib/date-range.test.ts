import { describe, expect, it } from "vitest";

import { parseDateRangeParams, isWithinDateRange, firstDateParam, buildDateRangeQuery } from "./date-range";

describe("parseDateRangeParams", () => {
  it("devuelve un rango vacío cuando no hay parámetros", () => {
    expect(parseDateRangeParams(new URLSearchParams())).toEqual({ from: undefined, to: undefined });
  });

  it("interpreta 'from' como el inicio del día y 'to' como el final del día", () => {
    const range = parseDateRangeParams(new URLSearchParams("from=2026-01-05&to=2026-01-10"));

    expect(range.from?.toISOString()).toBe(new Date("2026-01-05T00:00:00").toISOString());
    expect(range.to?.toISOString()).toBe(new Date("2026-01-10T23:59:59.999").toISOString());
  });

  it("ignora valores vacíos", () => {
    expect(parseDateRangeParams(new URLSearchParams("from=&to="))).toEqual({ from: undefined, to: undefined });
  });

  it("acepta un objeto plano de searchParams (Next.js) además de URLSearchParams", () => {
    const range = parseDateRangeParams({ from: "2026-02-01", to: undefined });

    expect(range.from?.toISOString()).toBe(new Date("2026-02-01T00:00:00").toISOString());
    expect(range.to).toBeUndefined();
  });
});

describe("isWithinDateRange", () => {
  it("acepta cualquier fecha cuando el rango está vacío", () => {
    expect(isWithinDateRange(new Date("2026-01-01"), {})).toBe(true);
  });

  it("rechaza fechas anteriores a 'from'", () => {
    const range = { from: new Date("2026-01-05T00:00:00") };
    expect(isWithinDateRange(new Date("2026-01-04T23:59:59"), range)).toBe(false);
    expect(isWithinDateRange(new Date("2026-01-05T00:00:00"), range)).toBe(true);
  });

  it("rechaza fechas posteriores a 'to'", () => {
    const range = { to: new Date("2026-01-10T23:59:59.999") };
    expect(isWithinDateRange(new Date("2026-01-11T00:00:00"), range)).toBe(false);
    expect(isWithinDateRange(new Date("2026-01-10T12:00:00"), range)).toBe(true);
  });
});

describe("firstDateParam", () => {
  it("devuelve undefined para valores vacíos o ausentes", () => {
    expect(firstDateParam(undefined)).toBeUndefined();
    expect(firstDateParam("")).toBeUndefined();
    expect(firstDateParam("  ")).toBeUndefined();
  });

  it("toma el primer valor si el parámetro llega como array", () => {
    expect(firstDateParam(["2026-01-05", "2026-01-06"])).toBe("2026-01-05");
  });

  it("devuelve el string recortado", () => {
    expect(firstDateParam(" 2026-01-05 ")).toBe("2026-01-05");
  });
});

describe("buildDateRangeQuery", () => {
  it("devuelve un string vacío sin filtros", () => {
    expect(buildDateRangeQuery({})).toBe("");
  });

  it("construye el query string con from y to", () => {
    expect(buildDateRangeQuery({ from: "2026-01-01", to: "2026-01-31" })).toBe("?from=2026-01-01&to=2026-01-31");
  });

  it("incluye solo el parámetro presente", () => {
    expect(buildDateRangeQuery({ from: "2026-01-01" })).toBe("?from=2026-01-01");
  });
});
