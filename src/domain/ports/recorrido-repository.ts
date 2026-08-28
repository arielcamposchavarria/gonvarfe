import type { Recorrido } from "../entities/recorrido";

export interface EscanearInput {
  /** Ausente cuando `skip` es true (modo demo). */
  qrValue?: string;
  skip: boolean;
}

export interface RecorridoRepository {
  /** POST /recorridos/escanear — el servidor decide a cuál registro corresponde, nunca el cliente. */
  escanear(input: EscanearInput): Promise<Recorrido>;
  /** POST /recorridos/reportar-perdido */
  reportarPerdido(motivo: string): Promise<Recorrido>;
  /** GET /recorridos/activo */
  activo(): Promise<Recorrido | null>;
  /** GET /recorridos/turno/:turnoId */
  porTurno(turnoId: string): Promise<Recorrido[]>;
  /** GET /recorridos/sitio/:sitioId — reporte admin/superAdmin. */
  porSitio(sitioId: string): Promise<Recorrido[]>;
  /** GET /recorridos/:id */
  porId(id: string): Promise<Recorrido | null>;
}
