import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { TurnoEstado } from "@/domain/entities/turno";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListRoundsBySiteDeps {
  recorridoRepository: RecorridoRepository;
  turnoRepository: TurnoRepository;
  userRepository: UserRepository;
}

export interface RoundWithGuard {
  recorrido: Recorrido;
  guardName: string;
  /** Turno al que pertenece el recorrido — todos sus escaneos caen bajo este turno hasta que se finaliza. */
  turnoId: string;
  turnoIniciadoEn: Date;
  /** "activo" habilita la acción de admin "Finalizar turno" sobre este grupo. */
  turnoEstado: TurnoEstado;
}

/**
 * Recorridos de un sitio, del más reciente (o en curso) al más antiguo. El
 * rango de fechas filtra por el INICIO DEL TURNO (no del recorrido individual)
 * para que un turno completo se mantenga junto aunque alguno de sus
 * recorridos haya arrancado ya pasada la medianoche.
 */
export async function listRoundsBySite(
  deps: ListRoundsBySiteDeps,
  siteId: string,
  range: DateRange = {},
): Promise<RoundWithGuard[]> {
  const [recorridos, turnos] = await Promise.all([
    deps.recorridoRepository.porSitio(siteId),
    deps.turnoRepository.porSitio(siteId),
  ]);

  const turnoById = new Map(turnos.map((turno) => [turno.id, turno]));
  const guardIds = [...new Set(turnos.map((turno) => turno.guardiaId))];
  const guards = await Promise.all(guardIds.map((id) => deps.userRepository.findById(id)));
  const guardNameById = new Map(guards.filter((guard) => guard !== null).map((guard) => [guard.id, guard.name]));

  const hasRangeFilter = range.from !== undefined || range.to !== undefined;

  const sorted = [...recorridos]
    .filter((recorrido) => {
      const turno = turnoById.get(recorrido.turnoId);
      if (!turno) return !hasRangeFilter;
      return isWithinDateRange(turno.iniciadoEn, range);
    })
    .sort((a, b) => b.iniciadoEn.getTime() - a.iniciadoEn.getTime());

  return sorted.map((recorrido) => {
    const turno = turnoById.get(recorrido.turnoId);
    const guardName = (turno && guardNameById.get(turno.guardiaId)) || "Guarda desconocido";
    return {
      recorrido,
      guardName,
      turnoId: recorrido.turnoId,
      turnoIniciadoEn: turno?.iniciadoEn ?? recorrido.iniciadoEn,
      turnoEstado: turno?.estado ?? "finalizado",
    };
  });
}
