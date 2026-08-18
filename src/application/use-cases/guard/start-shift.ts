import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { ClockService } from "@/domain/ports/clock-service";
import type { GuardUser } from "@/domain/entities/user";
import type { ShiftSession } from "@/domain/entities/shift-session";
import type { Round } from "@/domain/entities/round";
import { buildRound } from "./round-builder";

export interface StartShiftDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
  clockService: ClockService;
}

export class ShiftAlreadyActiveError extends Error {
  constructor() {
    super("Ya existe una jornada activa para este guard.");
    this.name = "ShiftAlreadyActiveError";
  }
}

export class SiteNotFoundError extends Error {
  constructor(siteId: string) {
    super(`No se encontró el sitio "${siteId}".`);
    this.name = "SiteNotFoundError";
  }
}

/**
 * Escanear el QR de inicio arranca la jornada y, en el mismo acto, cuenta
 * como el escaneo de la estación 1 del primer recorrido.
 */
export async function startShift(
  deps: StartShiftDeps,
  guard: GuardUser,
): Promise<{ session: ShiftSession; round: Round }> {
  const existing = await deps.shiftSessionRepository.findActiveByGuard(guard.id);
  if (existing) throw new ShiftAlreadyActiveError();

  const site = await deps.siteRepository.findById(guard.assignedSiteId);
  if (!site) throw new SiteNotFoundError(guard.assignedSiteId);

  const now = deps.clockService.now();

  const session: ShiftSession = {
    id: crypto.randomUUID(),
    guardId: guard.id,
    siteId: site.id,
    startedAt: now,
    status: "active",
    endedAt: null,
  };
  await deps.shiftSessionRepository.create(session);

  const round = buildRound({
    id: crypto.randomUUID(),
    shiftSessionId: session.id,
    site,
    sequence: 1,
    startedAt: now,
  });
  const firstStation = round.scans.find((scan) => scan.order === 1);
  if (firstStation) {
    firstStation.status = "on-time";
    firstStation.scannedAt = now;
  }
  await deps.roundRepository.create(round);

  return { session, round };
}
