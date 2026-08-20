export interface Station {
  readonly id: string;
  readonly siteId: string;
  readonly name: string;
  /** Orden dentro del recorrido, empezando en 1. La estación 1 coincide con el QR de inicio. */
  readonly order: number;
  readonly qrCodeId: string;
}
