import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingrese su contraseña actual"),
    newPassword: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
    confirmNewPassword: z.string().min(1, "Confirme la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormInput = z.infer<typeof changePasswordSchema>;
