export type RecoveryType = "username" | "password";

export type VerifyRecoveryResult =
  | { type: "username"; username: string }
  | { type: "password"; verified: true };

export class InvalidRecoveryCodeError extends Error {
  constructor() {
    super("Código inválido o expirado.");
    this.name = "InvalidRecoveryCodeError";
  }
}

export interface RecoveryService {
  requestCode(email: string, type: RecoveryType): Promise<void>;
  verifyCode(email: string, code: string, type: RecoveryType): Promise<VerifyRecoveryResult>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
}
