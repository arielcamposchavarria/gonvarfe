import type {
  RecoveryService,
  RecoveryType,
  VerifyRecoveryResult,
} from "@/domain/ports/recovery-service";

export interface VerifyRecoveryCodeDeps {
  recoveryService: RecoveryService;
}

export interface VerifyRecoveryCodeInput {
  email: string;
  code: string;
  type: RecoveryType;
}

export async function verifyRecoveryCode(
  { recoveryService }: VerifyRecoveryCodeDeps,
  { email, code, type }: VerifyRecoveryCodeInput,
): Promise<VerifyRecoveryResult> {
  return recoveryService.verifyCode(email, code, type);
}
