import { z } from "zod";
import { INCIDENT_TYPES } from "@/domain/value-objects/incident-type";

export const incidentLogSchema = z.object({
  incidentType: z.enum(INCIDENT_TYPES, { message: "Seleccione el tipo de incidencia" }),
  locationZone: z.string().trim().min(1, "Indique el local o zona"),
  description: z.string().trim().min(1, "Describa la incidencia"),
});

export type IncidentLogInput = z.infer<typeof incidentLogSchema>;
