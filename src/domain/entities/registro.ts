export type RegistroEstado = "pendiente" | "a-tiempo" | "perdido";

/**
 * Un registro por marca dentro de un recorrido, creado por adelantado al
 * iniciar el recorrido. `abreEn`/`cierraEn` son calculados y devueltos por el
 * backend (fuente de verdad); el frontend solo los consume para mostrar la
 * hora estimada de cada marca — ya no hay restricción de tiempo por marca,
 * solo se respeta el tiempo total del recorrido (ver `ROUND_DURATION_MINUTES`).
 */
export interface Registro {
  readonly id: string;
  readonly marcaId: string;
  readonly orden: number;
  estado: RegistroEstado;
  readonly abreEn: Date;
  readonly cierraEn: Date;
  escaneadoEn: Date | null;
  motivoPerdido: string | null;
  fotos?: string[] | null;
  observacion?: string | null;
}
