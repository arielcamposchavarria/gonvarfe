export type QrCodeKind = "start" | "station" | "exit";

/**
 * El QR de inicio también funciona como la estación 1; el de salida es de un
 * solo uso y marca el fin definitivo de la jornada del guard.
 */
export interface QrCode {
  readonly id: string;
  readonly siteId: string;
  readonly kind: QrCodeKind;
  readonly stationId: string | null;
  readonly singleUse: boolean;
  usedAt: Date | null;
}

export function isQrCodeConsumed(qrCode: QrCode): boolean {
  return qrCode.singleUse && qrCode.usedAt !== null;
}
