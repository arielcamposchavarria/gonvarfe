import type { Registro } from "./registro";

export type RecorridoEstado = "en-progreso" | "completado";

/** Una vuelta completa a todas las marcas activas del sitio, dentro de un turno. */
export interface Recorrido {
  readonly id: string;
  readonly turnoId: string;
  readonly sitioId: string;
  readonly secuencia: number;
  readonly iniciadoEn: Date;
  estado: RecorridoEstado;
  completadoEn: Date | null;
  registros: Registro[];
}
