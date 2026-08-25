import { z } from "zod";
import { ROLES } from "@/domain/value-objects/role";

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, "Ingrese el nombre"),
    username: z
      .string()
      .trim()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .regex(/^[a-zA-Z0-9._-]+$/, "El usuario solo puede tener letras, números, puntos, guiones y guion bajo"),
    password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
    role: z.enum(ROLES, { message: "Seleccione un rol" }),
    assignedSiteId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "guard" && !data.assignedSiteId) {
      ctx.addIssue({
        code: "custom",
        path: ["assignedSiteId"],
        message: "Seleccione el sitio asignado",
      });
    }
  });

export type CreateUserFormInput = z.infer<typeof createUserSchema>;
