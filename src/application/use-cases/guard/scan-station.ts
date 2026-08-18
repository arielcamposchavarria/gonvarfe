import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { ClockService } from "@/domain/ports/clock-service";
import type { Round } from "@/domain/entities/round";
import type { Site } from "@/domain/entities/site";
import { hasWindowOpened } from "@/domain/value-objects/time-window";
import { buildRound } from "./round-builder";

export interface ScanStationDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
  clockService: ClockService;
}

export interface ScanStationInput {
  guardId: string;
  stationId: string;
}

export class NoActiveShiftError extends Error {
  constructor() {
    super("No hay una jornada activa para este guard. Escanee primero el QR de inicio.");
    this.name = "NoActiveShiftError";
  }
}

export class SiteNotFoundError extends Error {
  constructor(siteId: string) {
    super(`No se encontró el sitio "${siteId}".`);
    this.name = "SiteNotFoundError";
  }
}

export class UnexpectedStationError extends Error {
  constructor() {
    super("No hay un recorrido en curso; debe escanear el QR de inicio para comenzar el siguiente recorrido.");
    this.name = "UnexpectedStationError";
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

export class StationWindowNotOpenError extends Error {
  constructor(public readonly opensAt: Date) {
    super(`Todavía no puede escanear esta estación. Se habilita a las ${opensAt.toLocaleTimeString()}.`);
    this.name = "StationWindowNotOpenError";
  }
}

export interface ScanStationResult {
  round: Round;
  roundCompleted: boolean;
}

export async function scanStation(deps: ScanStationDeps, input: ScanStationInput): Promise<ScanStationResult> {
  const session = await deps.shiftSessionRepository.findActiveByGuard(input.guardId);
  if (!session) throw new NoActiveShiftError();

  const site = await deps.siteRepository.findById(session.siteId);
  if (!site) throw new SiteNotFoundError(session.siteId);

  const now = deps.clockService.now();
  const activeRound = await deps.roundRepository.findActiveByShiftSession(session.id);

  if (!activeRound) {
    return startNextRound(deps, { site, session, stationId: input.stationId, now });
  }

  const scan = activeRound.scans.find((s) => s.stationId === input.stationId);
  if (!scan) throw new StationNotInRoundError(input.stationId);
  if (scan.status !== "pending") throw new StationAlreadyResolvedError();
  if (!hasWindowOpened(scan.window, now)) throw new StationWindowNotOpenError(scan.window.opensAt);

  scan.status = "on-time";
  scan.scannedAt = now;

  const roundCompleted = activeRound.scans.every((s) => s.status !== "pending");
  if (roundCompleted) {
    activeRound.status = "completed";
    activeRound.completedAt = now;
  }
  await deps.roundRepository.update(activeRound);

  return { round: activeRound, roundCompleted };
}

async function startNextRound(
  deps: ScanStationDeps,
  params: { site: Site; session: { id: string }; stationId: string; now: Date },
): Promise<ScanStationResult> {
  const firstStation = params.site.stations.find((station) => station.order === 1);
  if (!firstStation || firstStation.id !== params.stationId) {
    throw new UnexpectedStationError();
  }

  const previousRounds = await deps.roundRepository.findByShiftSession(params.session.id);
  const round = buildRound({
    id: crypto.randomUUID(),
    shiftSessionId: params.session.id,
    site: params.site,
    sequence: previousRounds.length + 1,
    startedAt: params.now,
  });

  const scan = round.scans.find((s) => s.order === 1);
  if (scan) {
    scan.status = "on-time";
    scan.scannedAt = params.now;
  }
  await deps.roundRepository.create(round);

  return { round, roundCompleted: false };
}
