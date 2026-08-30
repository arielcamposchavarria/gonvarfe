import { z } from "zod";

export const createSiteSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre del sitio"),
  address: z.string().trim().min(1, "Ingrese la dirección"),
  visitingLocals: z
    .array(z.string())
    .transform((values) => values.map((value) => value.trim()).filter((value) => value.length > 0))
    .default([]),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
