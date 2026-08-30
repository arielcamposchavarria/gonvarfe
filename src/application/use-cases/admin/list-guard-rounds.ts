import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Recorrido } from "@/domain/entities/recorrido";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListGuardRoundsDeps {
  turnoRepository: TurnoRepository;
  recorridoRepository: RecorridoRepository;
  sitioRepository: SitioRepository;
}

export interface RoundWithSite {
  recorrido: Recorrido;
  siteName: string;
}

/** Recorridos de un guard a través de todos sus turnos, del más reciente (o en curso) al más antiguo. */
export async function listGuardRounds(
  deps: ListGuardRoundsDeps,
  guardId: string,
  range: DateRange = {},
): Promise<RoundWithSite[]> {
  const turnos = await deps.turnoRepository.porGuardia(guardId);
  const recorridosByTurno = await Promise.all(turnos.map((turno) => deps.recorridoRepository.porTurno(turno.id)));
  const recorridos = recorridosByTurno.flat();

  const sitios = await deps.sitioRepository.findAll();
  const siteNameById = new Map(sitios.map((sitio) => [sitio.id, sitio.nombre]));

  return [...recorridos]
    .filter((recorrido) => isWithinDateRange(recorrido.iniciadoEn, range))
    .sort((a, b) => b.iniciadoEn.getTime() - a.iniciadoEn.getTime())
    .map((recorrido) => ({ recorrido, siteName: siteNameById.get(recorrido.sitioId) ?? recorrido.sitioId }));
}
