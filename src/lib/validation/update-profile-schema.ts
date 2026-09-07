import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre"),
});

export type UpdateProfileFormInput = z.infer<typeof updateProfileSchema>;
