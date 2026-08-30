import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { GuardSitioRepository } from "@/domain/ports/guard-sitio-repository";
import type { Turno } from "@/domain/entities/turno";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

export interface ObtenerEstadoTurnoDeps {
  turnoRepository: TurnoRepository;
  recorridoRepository: RecorridoRepository;
  guardSitioRepository: GuardSitioRepository;
}

export interface EstadoTurno {
  turno: Turno | null;
  /** null si no hay turno activo, o si el sitio dejó de estar activo mientras el turno seguía abierto. */
  sitio: GuardSitio | null;
  recorridoActivo: Recorrido | null;
  recorridosCompletados: number;
}

/**
 * Fuente de verdad de "qué sitio cubre este guard ahora": nunca se persiste
 * en el cliente, se recalcula en cada carga del dashboard a partir de
 * GET /turnos/activo.
 */
export async function obtenerEstadoTurno(deps: ObtenerEstadoTurnoDeps): Promise<EstadoTurno> {
  const turno = await deps.turnoRepository.activo();
  if (!turno) {
    return { turno: null, sitio: null, recorridoActivo: null, recorridosCompletados: 0 };
  }

  const [sitios, recorridos, recorridoActivo] = await Promise.all([
    deps.guardSitioRepository.findAll(),
    deps.recorridoRepository.porTurno(turno.id),
    deps.recorridoRepository.activo(),
  ]);

  const sitio = sitios.find((s) => s.id === turno.sitioId) ?? null;
  const recorridosCompletados = recorridos.filter((recorrido) => recorrido.estado === "completado").length;

  return { turno, sitio, recorridoActivo, recorridosCompletados };
}
