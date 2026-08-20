export const INCIDENT_TYPES = [
  "Robo o hurto",
  "Vandalismo o daño a la propiedad",
  "Accidente",
  "Disturbio o pelea",
  "Persona sospechosa",
  "Emergencia médica",
  "Incendio",
  "Otro",
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];

export function isIncidentType(value: string): value is IncidentType {
  return (INCIDENT_TYPES as readonly string[]).includes(value);
}
