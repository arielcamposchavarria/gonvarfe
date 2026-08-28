import type { Turno } from "../entities/turno";

export interface TurnoRepository {
  /** GET /turnos/activo — turno activo del guard autenticado, o null si no ha iniciado uno. */
  activo(): Promise<Turno | null>;
  /** POST /turnos — inicia turno para el guard autenticado en el sitio indicado. */
  iniciar(sitioId: string): Promise<Turno>;
  /** PATCH /turnos/:id/finalizar */
  finalizar(turnoId: string): Promise<Turno>;
  /** GET /turnos/guardia/:guardiaId — reporte admin/superAdmin. */
  porGuardia(guardiaId: string): Promise<Turno[]>;
  /** GET /turnos/sitio/:sitioId — reporte admin/superAdmin. */
  porSitio(sitioId: string): Promise<Turno[]>;
}
