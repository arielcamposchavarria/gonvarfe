import type { QrCodeRepository } from "@/domain/ports/qr-code-repository";
import { qrCodes } from "../data/qr-codes";

export function createMockQrCodeRepository(): QrCodeRepository {
  const store = new Map(qrCodes.map((qrCode) => [qrCode.id, { ...qrCode }]));

  return {
    async findById(id) {
      return store.get(id) ?? null;
    },
    async markUsed(id, usedAt) {
      const qrCode = store.get(id);
      if (!qrCode) throw new Error(`QR no encontrado: ${id}`);
      const updated = { ...qrCode, usedAt };
      store.set(id, updated);
      return updated;
    },
  };
}
