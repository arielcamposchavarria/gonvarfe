import { z } from "zod";

export const recoveryEmailSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
});

export const recoveryCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{4}$/, "El código debe tener 4 dígitos"),
});

export const recoveryNewPasswordSchema = z
  .object({
    password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
    confirmPassword: z.string().min(1, "Confirme la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
