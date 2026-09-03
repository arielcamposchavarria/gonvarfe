export interface RoundEntry {
  recorrido: { secuencia: number };
  turnoId: string;
  turnoIniciadoEn: Date;
}

export interface TurnoGroup<T> {
  turnoId: string;
  turnoIniciadoEn: Date;
  items: T[];
}

/**
 * Agrupa recorridos por el turno al que pertenecen (todos los recorridos y
 * QRs escaneados entre "iniciar turno" y "finalizar turno" son de ese mismo
 * turno). Grupos ordenados del turno más reciente al más antiguo; dentro de
 * cada grupo, los recorridos en orden cronológico (secuencia ascendente).
 */
export function groupRoundsByTurno<T extends RoundEntry>(rounds: T[]): TurnoGroup<T>[] {
  const groups = new Map<string, TurnoGroup<T>>();

  for (const round of rounds) {
    let group = groups.get(round.turnoId);
    if (!group) {
      group = { turnoId: round.turnoId, turnoIniciadoEn: round.turnoIniciadoEn, items: [] };
      groups.set(round.turnoId, group);
    }
    group.items.push(round);
  }

  const result = [...groups.values()];
  result.sort((a, b) => b.turnoIniciadoEn.getTime() - a.turnoIniciadoEn.getTime());
  for (const group of result) {
    group.items.sort((a, b) => a.recorrido.secuencia - b.recorrido.secuencia);
  }
  return result;
}
