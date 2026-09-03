import { z } from "zod";
import { ROLES } from "@/domain/value-objects/role";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Ingrese el nombre"),
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "El usuario solo puede tener letras, números, puntos, guiones y guion bajo"),
  email: z.string().trim().email("Correo inválido"),
  role: z.enum(ROLES, { message: "Seleccione un rol" }),
});

export type CreateUserFormInput = z.infer<typeof createUserSchema>;
