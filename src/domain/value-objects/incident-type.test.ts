import { describe, expect, it } from "vitest";

import { INCIDENT_TYPES, isIncidentType } from "./incident-type";

describe("incident-type", () => {
  it("reconoce los tipos válidos", () => {
    for (const type of INCIDENT_TYPES) {
      expect(isIncidentType(type)).toBe(true);
    }
  });

  it("rechaza un tipo que no está en la lista", () => {
    expect(isIncidentType("Tipo inventado")).toBe(false);
  });
});
