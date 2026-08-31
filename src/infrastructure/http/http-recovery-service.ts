import {
  InvalidRecoveryCodeError,
  type RecoveryService,
  type VerifyRecoveryResult,
} from "@/domain/ports/recovery-service";

/** Adaptador HTTP del puerto `RecoveryService` contra el backend real (gonvarbe). */
export function createHttpRecoveryService(): RecoveryService {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  return {
    async requestCode(email, type): Promise<void> {
      const res = await fetch(`${baseUrl}/auth/recovery/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo solicitar el código.");
    },

    async verifyCode(email, code, type): Promise<VerifyRecoveryResult> {
      const res = await fetch(`${baseUrl}/auth/recovery/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, type }),
        cache: "no-store",
      });
      if (res.status === 401) throw new InvalidRecoveryCodeError();
      if (!res.ok) throw new Error("No se pudo verificar el código.");
      return (await res.json()) as VerifyRecoveryResult;
    },

    async resetPassword(email, code, newPassword): Promise<void> {
      const res = await fetch(`${baseUrl}/auth/recovery/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
        cache: "no-store",
      });
      if (res.status === 401) throw new InvalidRecoveryCodeError();
      if (!res.ok) throw new Error("No se pudo restablecer la contraseña.");
    },
  };
}
