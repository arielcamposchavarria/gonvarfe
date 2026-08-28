export type TurnoEstado = "activo" | "finalizado";

/** Desde que el guard inicia turno en un sitio hasta que lo finaliza. */
export interface Turno {
  readonly id: string;
  readonly guardiaId: string;
  readonly sitioId: string;
  readonly iniciadoEn: Date;
  estado: TurnoEstado;
  finalizadoEn: Date | null;
}
