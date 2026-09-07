import type { Recorrido } from "../entities/recorrido";

export interface EscanearInput {
  /** Ausente cuando `skip` es true (modo demo). */
  qrValue?: string;
  skip: boolean;
  /** Fotos adjuntas a la marca resuelta (opcional, máximo MAX_LOG_IMAGES). */
  fotos?: string[];
  /** Observación opcional sobre la marca resuelta. */
  observacion?: string;
}

export interface ReportarPerdidoInput {
  motivo: string;
  fotos?: string[];
  observacion?: string;
  /**
   * Ambos presentes (o ninguno): justifica una marca puntual en vez del
   * objetivo actual del recorrido activo. Uso: reportar marcas que quedaron
   * pendientes de un recorrido ya vencido.
   */
  recorridoId?: string;
  registroId?: string;
}

export interface RecorridoRepository {
  /** POST /recorridos/escanear — el servidor decide a cuál registro corresponde, nunca el cliente. */
  escanear(input: EscanearInput): Promise<Recorrido>;
  /** POST /recorridos/reportar-perdido */
  reportarPerdido(input: ReportarPerdidoInput): Promise<Recorrido>;
  /** GET /recorridos/activo */
  activo(): Promise<Recorrido | null>;
  /** GET /recorridos/turno/:turnoId */
  porTurno(turnoId: string): Promise<Recorrido[]>;
  /** GET /recorridos/sitio/:sitioId — reporte admin/superAdmin. */
  porSitio(sitioId: string): Promise<Recorrido[]>;
  /** GET /recorridos/:id */
  porId(id: string): Promise<Recorrido | null>;
}
