import type { UserRepository } from "@/domain/ports/user-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { Sitio } from "@/domain/entities/sitio";

export interface GetGuardDetailDeps {
  userRepository: UserRepository;
  sitioRepository: SitioRepository;
  turnoRepository: TurnoRepository;
  recorridoRepository: RecorridoRepository;
  entryLogRepository: EntryLogRepository;
  incidentLogRepository: IncidentLogRepository;
}

export interface GuardDetail {
  guard: GuardUser;
  /** Sitio donde está el guard ahora mismo (según su turno más reciente activo), o null si no tiene uno. */
  currentSite: Sitio | null;
  totals: {
    scansOnTime: number;
    scansMissed: number;
    roundsCompleted: number;
    entryLogsCount: number;
    incidentLogsCount: number;
  };
}

export async function getGuardDetail(deps: GetGuardDetailDeps, guardId: string): Promise<GuardDetail | null> {
  const guard = await deps.userRepository.findById(guardId);
  if (!guard || guard.role !== "guard") return null;

  const turnos = await deps.turnoRepository.porGuardia(guard.id);
  const activeTurno = turnos.find((turno) => turno.estado === "activo") ?? null;
  const currentSite = activeTurno ? await deps.sitioRepository.findById(activeTurno.sitioId) : null;

  const recorridosByTurno = await Promise.all(turnos.map((turno) => deps.recorridoRepository.porTurno(turno.id)));
  const recorridos = recorridosByTurno.flat();
  const registros = recorridos.flatMap((recorrido) => recorrido.registros);

  const [entryLogs, incidentLogs] = await Promise.all([
    deps.entryLogRepository.findByGuard(guard.id),
    deps.incidentLogRepository.findByGuard(guard.id),
  ]);

  return {
    guard,
    currentSite,
    totals: {
      scansOnTime: registros.filter((registro) => registro.estado === "a-tiempo").length,
      scansMissed: registros.filter((registro) => registro.estado === "perdido").length,
      roundsCompleted: recorridos.filter((recorrido) => recorrido.estado === "completado").length,
      entryLogsCount: entryLogs.length,
      incidentLogsCount: incidentLogs.length,
    },
  };
}
