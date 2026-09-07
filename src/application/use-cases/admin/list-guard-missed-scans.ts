import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListGuardMissedScansDeps {
  turnoRepository: TurnoRepository;
  recorridoRepository: RecorridoRepository;
  sitioRepository: SitioRepository;
}

export interface MissedScanEntry {
  siteName: string;
  stationName: string;
  roundSequence: number;
  reason: string;
  reportedAt: Date;
  fotos: string[] | null;
  observacion: string | null;
}

/**
 * Marcas que el guard no pudo escanear, con el motivo reportado, de la más
 * reciente a la más antigua. El backend no persiste el instante exacto en
 * que se reportó el motivo, así que se usa el cierre de la ventana
 * (`cierraEn`) como referencia temporal más cercana disponible.
 */
export async function listGuardMissedScans(
  deps: ListGuardMissedScansDeps,
  guardId: string,
  range: DateRange = {},
): Promise<MissedScanEntry[]> {
  const turnos = await deps.turnoRepository.porGuardia(guardId);
  const recorridosByTurno = await Promise.all(turnos.map((turno) => deps.recorridoRepository.porTurno(turno.id)));
  const recorridos = recorridosByTurno.flat();

  const sitios = await deps.sitioRepository.findAll();
  const sitioById = new Map(sitios.map((sitio) => [sitio.id, sitio]));

  const entries: MissedScanEntry[] = [];
  for (const recorrido of recorridos) {
    const sitio = sitioById.get(recorrido.sitioId);
    const marcaById = new Map((sitio?.marcas ?? []).map((marca) => [marca.id, marca]));

    for (const registro of recorrido.registros) {
      if (registro.estado !== "perdido" || !registro.motivoPerdido) continue;
      if (!isWithinDateRange(registro.cierraEn, range)) continue;
      const marca = marcaById.get(registro.marcaId);
      entries.push({
        siteName: sitio?.nombre ?? recorrido.sitioId,
        stationName: marca?.nombre ?? registro.marcaId,
        roundSequence: recorrido.secuencia,
        reason: registro.motivoPerdido,
        reportedAt: registro.cierraEn,
        fotos: registro.fotos ?? null,
        observacion: registro.observacion ?? null,
      });
    }
  }

  return entries.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
}
