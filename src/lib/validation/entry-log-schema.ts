import { z } from "zod";
import { isValidCedula } from "@/domain/value-objects/cedula";
import { isValidPlateNumber } from "@/domain/value-objects/plate-number";

export const entryLogSchema = z.object({
  date: z.string().trim().min(1, "Seleccione la fecha"),
  entryTime: z.string().trim().min(1, "Ingrese la hora de ingreso"),
  exitTime: z.string().trim().min(1, "Ingrese la hora de salida"),
  plate: z
    .string()
    .trim()
    .min(1, "Ingrese la placa")
    .refine(isValidPlateNumber, "Placa inválida"),
  driverName: z.string().trim().min(1, "Ingrese el nombre del conductor"),
  cedula: z
    .string()
    .trim()
    .min(1, "Ingrese la cédula")
    .refine(isValidCedula, "Cédula inválida: debe tener 9 dígitos"),
  company: z.string().trim().min(1, "Ingrese la empresa"),
  reason: z.string().trim().min(1, "Ingrese el motivo"),
  visitingLocal: z.string().trim().min(1, "Seleccione el local que visita"),
  observations: z.string().trim().optional().default(""),
});

export type EntryLogInput = z.infer<typeof entryLogSchema>;
