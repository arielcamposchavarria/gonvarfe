import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { UserRepository } from "@/domain/ports/user-repository";
import type { Recorrido } from "@/domain/entities/recorrido";

export interface ListRoundsBySiteDeps {
  recorridoRepository: RecorridoRepository;
  turnoRepository: TurnoRepository;
  userRepository: UserRepository;
}

export interface RoundWithGuard {
  recorrido: Recorrido;
  guardName: string;
}

/** Recorridos de un sitio, del más reciente (o en curso) al más antiguo. */
export async function listRoundsBySite(deps: ListRoundsBySiteDeps, siteId: string): Promise<RoundWithGuard[]> {
  const [recorridos, turnos] = await Promise.all([
    deps.recorridoRepository.porSitio(siteId),
    deps.turnoRepository.porSitio(siteId),
  ]);

  const turnoById = new Map(turnos.map((turno) => [turno.id, turno]));
  const guardIds = [...new Set(turnos.map((turno) => turno.guardiaId))];
  const guards = await Promise.all(guardIds.map((id) => deps.userRepository.findById(id)));
  const guardNameById = new Map(guards.filter((guard) => guard !== null).map((guard) => [guard.id, guard.name]));

  const sorted = [...recorridos].sort((a, b) => b.iniciadoEn.getTime() - a.iniciadoEn.getTime());

  return sorted.map((recorrido) => {
    const turno = turnoById.get(recorrido.turnoId);
    const guardName = (turno && guardNameById.get(turno.guardiaId)) || "Guarda desconocido";
    return { recorrido, guardName };
  });
}
