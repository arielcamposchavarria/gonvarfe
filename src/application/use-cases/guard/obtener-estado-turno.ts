import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { GuardSitioRepository } from "@/domain/ports/guard-sitio-repository";
import type { Turno } from "@/domain/entities/turno";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Registro } from "@/domain/entities/registro";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

export interface ObtenerEstadoTurnoDeps {
  turnoRepository: TurnoRepository;
  recorridoRepository: RecorridoRepository;
  guardSitioRepository: GuardSitioRepository;
}

/** Una marca que quedo pendiente en un recorrido que ya no es el activo (venció con marcas sin escanear). */
export interface RegistroPendienteAnterior {
  recorridoId: string;
  registro: Registro;
}

export interface EstadoTurno {
  turno: Turno | null;
  /** null si no hay turno activo, o si el sitio dejó de estar activo mientras el turno seguía abierto. */
  sitio: GuardSitio | null;
  recorridoActivo: Recorrido | null;
  recorridosCompletados: number;
  /** Marcas pendientes de recorridos anteriores (ya no activos) de este turno — a reportar con "No pude escanear". */
  pendientesRecorridoAnterior: RegistroPendienteAnterior[];
}

/**
 * Fuente de verdad de "qué sitio cubre este guard ahora": nunca se persiste
 * en el cliente, se recalcula en cada carga del dashboard a partir de
 * GET /turnos/activo.
 */
export async function obtenerEstadoTurno(deps: ObtenerEstadoTurnoDeps): Promise<EstadoTurno> {
  const turno = await deps.turnoRepository.activo();
  if (!turno) {
    return { turno: null, sitio: null, recorridoActivo: null, recorridosCompletados: 0, pendientesRecorridoAnterior: [] };
  }

  const [sitios, recorridos, recorridoActivo] = await Promise.all([
    deps.guardSitioRepository.findAll(),
    deps.recorridoRepository.porTurno(turno.id),
    deps.recorridoRepository.activo(),
  ]);

  const sitio = sitios.find((s) => s.id === turno.sitioId) ?? null;
  const recorridosCompletados = recorridos.filter((recorrido) => recorrido.estado === "completado").length;
  const pendientesRecorridoAnterior = recorridos
    .filter((recorrido) => recorrido.id !== recorridoActivo?.id)
    .flatMap((recorrido) =>
      recorrido.registros
        .filter((registro) => registro.estado === "pendiente")
        .map((registro) => ({ recorridoId: recorrido.id, registro })),
    );

  return { turno, sitio, recorridoActivo, recorridosCompletados, pendientesRecorridoAnterior };
}
