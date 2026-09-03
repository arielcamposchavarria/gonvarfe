"use server";

import { container } from "@/infrastructure/container";
import { InvalidRecoveryCodeError, type RecoveryType } from "@/domain/ports/recovery-service";
import {
  recoveryCodeSchema,
  recoveryEmailSchema,
  recoveryNewPasswordSchema,
} from "@/lib/validation/recover-account-schema";

export type RequestRecoveryCodeResult = { ok: true } | { ok: false; error: string };

export async function requestRecoveryCodeAction(
  email: string,
  type: RecoveryType,
): Promise<RequestRecoveryCodeResult> {
  const parsed = recoveryEmailSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Correo inválido." };
  }

  await container.requestRecoveryCode({ email: parsed.data.email, type });
  return { ok: true };
}

export type VerifyRecoveryCodeResult =
  | { ok: true; type: "username"; username: string }
  | { ok: true; type: "password" }
  | { ok: false; error: string };

export async function verifyRecoveryCodeAction(
  email: string,
  code: string,
  type: RecoveryType,
): Promise<VerifyRecoveryCodeResult> {
  const parsed = recoveryCodeSchema.safeParse({ code });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Código inválido." };
  }

  try {
    const result = await container.verifyRecoveryCode({ email, code: parsed.data.code, type });
    if (result.type === "username") {
      return { ok: true, type: "username", username: result.username };
    }
    return { ok: true, type: "password" };
  } catch (error) {
    if (error instanceof InvalidRecoveryCodeError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export type ResetPasswordWithCodeResult = { ok: true } | { ok: false; error: string };

export async function resetPasswordWithCodeAction(
  email: string,
  code: string,
  password: string,
  confirmPassword: string,
): Promise<ResetPasswordWithCodeResult> {
  const parsed = recoveryNewPasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await container.resetPasswordWithCode({ email, code, newPassword: parsed.data.password });
    return { ok: true };
  } catch (error) {
    if (error instanceof InvalidRecoveryCodeError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}
