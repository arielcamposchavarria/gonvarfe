import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Ingrese su usuario"),
  password: z.string().min(1, "Ingrese su contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;
