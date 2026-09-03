import type { RecoveryService, RecoveryType } from "@/domain/ports/recovery-service";

export interface RequestRecoveryCodeDeps {
  recoveryService: RecoveryService;
}

export interface RequestRecoveryCodeInput {
  email: string;
  type: RecoveryType;
}

export async function requestRecoveryCode(
  { recoveryService }: RequestRecoveryCodeDeps,
  { email, type }: RequestRecoveryCodeInput,
): Promise<void> {
  await recoveryService.requestCode(email, type);
}
