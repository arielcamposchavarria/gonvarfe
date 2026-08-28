export type RegistroEstado = "pendiente" | "a-tiempo" | "perdido";

/**
 * Un registro por marca dentro de un recorrido, creado por adelantado al
 * iniciar el recorrido. `abreEn`/`cierraEn` son calculados y devueltos por el
 * backend (fuente de verdad); el frontend solo los consume para UI
 * (countdown, deshabilitar "Escanear" hasta que abra la ventana).
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
}
