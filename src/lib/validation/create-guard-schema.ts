import { z } from "zod";

export const createGuardSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre"),
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "El usuario solo puede tener letras, números, puntos, guiones y guion bajo"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});

export type CreateGuardInput = z.infer<typeof createGuardSchema>;
