import { describe, expect, it } from "vitest";

import { incidentLogSchema } from "./incident-log-schema";

describe("incidentLogSchema", () => {
  it("acepta un tipo de incidencia válido", () => {
    const result = incidentLogSchema.safeParse({
      incidentType: "Accidente",
      locationZone: "Parqueo principal",
      description: "Colisión leve entre dos vehículos.",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un tipo de incidencia fuera de la lista", () => {
    const result = incidentLogSchema.safeParse({
      incidentType: "Tipo inventado",
      locationZone: "Parqueo principal",
      description: "Descripción",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una descripción vacía", () => {
    const result = incidentLogSchema.safeParse({
      incidentType: "Accidente",
      locationZone: "Parqueo principal",
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza tipo Otro sin especificar el detalle", () => {
    const result = incidentLogSchema.safeParse({
      incidentType: "Otro",
      locationZone: "Parqueo principal",
      description: "Descripción",
    });
    expect(result.success).toBe(false);
  });

  it("acepta tipo Otro con el detalle especificado", () => {
    const result = incidentLogSchema.safeParse({
      incidentType: "Otro",
      incidentTypeDetail: "Fuga de agua",
      locationZone: "Parqueo principal",
      description: "Descripción",
    });
    expect(result.success).toBe(true);
  });
});
