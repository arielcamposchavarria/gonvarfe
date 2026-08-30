import { z } from "zod";

export const updateSiteSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre del sitio"),
  address: z.string().trim().min(1, "Ingrese la dirección"),
});

export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
