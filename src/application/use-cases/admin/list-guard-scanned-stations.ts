import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { SitioRepository } from "@/domain/ports/sitio-repository";
import { isWithinDateRange, type DateRange } from "@/lib/date-range";

export interface ListGuardScannedStationsDeps {
  turnoRepository: TurnoRepository;
  recorridoRepository: RecorridoRepository;
  sitioRepository: SitioRepository;
}

export interface ScannedStationEntry {
  siteName: string;
  stationName: string;
  roundSequence: number;
  scannedAt: Date;
  fotos: string[] | null;
  observacion: string | null;
}

/** Marcas que el guard escaneó a tiempo, de la más reciente a la más antigua. */
export async function listGuardScannedStations(
  deps: ListGuardScannedStationsDeps,
  guardId: string,
  range: DateRange = {},
): Promise<ScannedStationEntry[]> {
  const turnos = await deps.turnoRepository.porGuardia(guardId);
  const recorridosByTurno = await Promise.all(turnos.map((turno) => deps.recorridoRepository.porTurno(turno.id)));
  const recorridos = recorridosByTurno.flat();

  const sitios = await deps.sitioRepository.findAll();
  const sitioById = new Map(sitios.map((sitio) => [sitio.id, sitio]));

  const entries: ScannedStationEntry[] = [];
  for (const recorrido of recorridos) {
    const sitio = sitioById.get(recorrido.sitioId);
    const marcaById = new Map((sitio?.marcas ?? []).map((marca) => [marca.id, marca]));

    for (const registro of recorrido.registros) {
      if (registro.estado !== "a-tiempo" || !registro.escaneadoEn) continue;
      if (!isWithinDateRange(registro.escaneadoEn, range)) continue;
      const marca = marcaById.get(registro.marcaId);
      entries.push({
        siteName: sitio?.nombre ?? recorrido.sitioId,
        stationName: marca?.nombre ?? registro.marcaId,
        roundSequence: recorrido.secuencia,
        scannedAt: registro.escaneadoEn,
        fotos: registro.fotos ?? null,
        observacion: registro.observacion ?? null,
      });
    }
  }

  return entries.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
}
