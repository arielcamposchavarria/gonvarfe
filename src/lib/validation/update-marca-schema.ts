import { z } from "zod";

export const updateMarcaSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre de la marca"),
});

export type UpdateMarcaInput = z.infer<typeof updateMarcaSchema>;
