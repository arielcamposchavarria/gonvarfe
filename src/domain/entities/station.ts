export interface Station {
  readonly id: string;
  readonly siteId: string;
  readonly name: string;
  /** Orden dentro del recorrido, 1 a STATIONS_PER_SITE. La estación 1 coincide con el QR de inicio. */
  readonly order: number;
  readonly qrCodeId: string;
}
