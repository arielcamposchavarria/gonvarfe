import { describe, expect, it } from "vitest";

import { entryLogSchema } from "./entry-log-schema";

const VALID_INPUT = {
  date: "2026-08-19",
  plate: "ABC123",
  driverName: "Juan Pérez",
  cedula: "123456789",
  company: "Acme S.A.",
  reason: "Entrega",
  visitingLocal: "BAC",
  observations: "",
};

describe("entryLogSchema", () => {
  it("acepta datos válidos", () => {
    const result = entryLogSchema.safeParse(VALID_INPUT);
    expect(result.success).toBe(true);
  });

  it("rechaza una cédula que no tiene 9 dígitos", () => {
    const result = entryLogSchema.safeParse({ ...VALID_INPUT, cedula: "123" });
    expect(result.success).toBe(false);
  });

  it("rechaza una placa vacía", () => {
    const result = entryLogSchema.safeParse({ ...VALID_INPUT, plate: "" });
    expect(result.success).toBe(false);
  });

  it("acepta que no se seleccione el local que visita (campo opcional)", () => {
    const result = entryLogSchema.safeParse({ ...VALID_INPUT, visitingLocal: "" });
    expect(result.success).toBe(true);
  });

  it("acepta que el local que visita esté ausente por completo", () => {
    const withoutVisitingLocal: Record<string, unknown> = { ...VALID_INPUT };
    delete withoutVisitingLocal.visitingLocal;
    const result = entryLogSchema.safeParse(withoutVisitingLocal);
    expect(result.success).toBe(true);
  });
});
