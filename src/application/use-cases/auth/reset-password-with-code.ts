import type { RecoveryService } from "@/domain/ports/recovery-service";

export interface ResetPasswordWithCodeDeps {
  recoveryService: RecoveryService;
}

export interface ResetPasswordWithCodeInput {
  email: string;
  code: string;
  newPassword: string;
}

export async function resetPasswordWithCode(
  { recoveryService }: ResetPasswordWithCodeDeps,
  { email, code, newPassword }: ResetPasswordWithCodeInput,
): Promise<void> {
  await recoveryService.resetPassword(email, code, newPassword);
}
