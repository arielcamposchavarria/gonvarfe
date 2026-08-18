import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { ClockService } from "@/domain/ports/clock-service";
import type { Round } from "@/domain/entities/round";

export interface ReportMissedScanDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  clockService: ClockService;
}

export interface ReportMissedScanInput {
  guardId: string;
  stationId: string;
  reason: string;
}

export class NoActiveShiftError extends Error {
  constructor() {
    super("No hay una jornada activa para este guard.");
    this.name = "NoActiveShiftError";
  }
}

export class NoActiveRoundError extends Error {
  constructor() {
    super("No hay un recorrido en curso.");
    this.name = "NoActiveRoundError";
  }
}

export class StationNotInRoundError extends Error {
  constructor(stationId: string) {
    super(`La estación "${stationId}" no pertenece al recorrido actual.`);
    this.name = "StationNotInRoundError";
  }
}

export class StationAlreadyResolvedError extends Error {
  constructor() {
    super("Esta estación ya fue escaneada o reportada.");
    this.name = "StationAlreadyResolvedError";
  }
}

export async function reportMissedScan(deps: ReportMissedScanDeps, input: ReportMissedScanInput): Promise<Round> {
  const reason = input.reason.trim();
  if (!reason) throw new Error("Debe indicar el motivo por el que no pudo escanear.");

  const session = await deps.shiftSessionRepository.findActiveByGuard(input.guardId);
  if (!session) throw new NoActiveShiftError();

  const round = await deps.roundRepository.findActiveByShiftSession(session.id);
  if (!round) throw new NoActiveRoundError();

  const scan = round.scans.find((s) => s.stationId === input.stationId);
  if (!scan) throw new StationNotInRoundError(input.stationId);
  if (scan.status !== "pending") throw new StationAlreadyResolvedError();

  const now = deps.clockService.now();
  scan.status = "missed";
  scan.missedReport = {
    id: crypto.randomUUID(),
    stationScanId: scan.id,
    reason,
    reportedAt: now,
  };

  const roundCompleted = round.scans.every((s) => s.status !== "pending");
  if (roundCompleted) {
    round.status = "completed";
    round.completedAt = now;
  }
  await deps.roundRepository.update(round);
  return round;
}
