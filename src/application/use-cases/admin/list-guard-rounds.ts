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
  /** Turno al que pertenece el recorrido — todos sus escaneos caen bajo este turno hasta que se finaliza. */
  turnoId: string;
  turnoIniciadoEn: Date;
}

/**
 * Recorridos de un guard a través de todos sus turnos, del más reciente (o
 * en curso) al más antiguo. El rango de fechas filtra por el INICIO DEL
 * TURNO (no del recorrido individual), para que un turno completo se
 * mantenga junto aunque alguno de sus recorridos haya arrancado ya pasada
 * la medianoche.
 */
export async function listGuardRounds(
  deps: ListGuardRoundsDeps,
  guardId: string,
  range: DateRange = {},
): Promise<RoundWithSite[]> {
  const turnos = await deps.turnoRepository.porGuardia(guardId);
  const turnoById = new Map(turnos.map((turno) => [turno.id, turno]));
  const recorridosByTurno = await Promise.all(turnos.map((turno) => deps.recorridoRepository.porTurno(turno.id)));
  const recorridos = recorridosByTurno.flat();

  const sitios = await deps.sitioRepository.findAll();
  const siteNameById = new Map(sitios.map((sitio) => [sitio.id, sitio.nombre]));

  return [...recorridos]
    .filter((recorrido) => {
      const turno = turnoById.get(recorrido.turnoId);
      return turno ? isWithinDateRange(turno.iniciadoEn, range) : false;
    })
    .sort((a, b) => b.iniciadoEn.getTime() - a.iniciadoEn.getTime())
    .map((recorrido) => ({
      recorrido,
      siteName: siteNameById.get(recorrido.sitioId) ?? recorrido.sitioId,
      turnoId: recorrido.turnoId,
      turnoIniciadoEn: turnoById.get(recorrido.turnoId)!.iniciadoEn,
    }));
}
