import { z } from "zod";

export const createSiteSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre del sitio"),
  address: z.string().trim().min(1, "Ingrese la dirección"),
  visitingLocals: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((local) => local.trim())
        .filter((local) => local.length > 0),
    ),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
