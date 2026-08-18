import type { QrCode } from "../entities/qr-code";

export interface QrCodeRepository {
  findById(id: string): Promise<QrCode | null>;
  markUsed(id: string, usedAt: Date): Promise<QrCode>;
}
