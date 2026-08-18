import type { ShiftSessionRepository } from "@/domain/ports/shift-session-repository";
import type { RoundRepository } from "@/domain/ports/round-repository";
import type { SiteRepository } from "@/domain/ports/site-repository";
import type { QrCodeRepository } from "@/domain/ports/qr-code-repository";
import type { ClockService } from "@/domain/ports/clock-service";
import type { ShiftSession } from "@/domain/entities/shift-session";
import { isQrCodeConsumed } from "@/domain/entities/qr-code";

export interface EndShiftDeps {
  shiftSessionRepository: ShiftSessionRepository;
  roundRepository: RoundRepository;
  siteRepository: SiteRepository;
  qrCodeRepository: QrCodeRepository;
  clockService: ClockService;
}

export class NoActiveShiftError extends Error {
  constructor() {
    super("No hay una jornada activa para este guard.");
    this.name = "NoActiveShiftError";
  }
}

export class RoundInProgressError extends Error {
  constructor() {
    super("No puede escanear la salida mientras haya un recorrido en curso.");
    this.name = "RoundInProgressError";
  }
}

export class ExitQrAlreadyUsedError extends Error {
  constructor() {
    super("El QR de salida ya fue utilizado.");
    this.name = "ExitQrAlreadyUsedError";
  }
}

export async function endShift(deps: EndShiftDeps, guardId: string): Promise<ShiftSession> {
  const session = await deps.shiftSessionRepository.findActiveByGuard(guardId);
  if (!session) throw new NoActiveShiftError();

  const activeRound = await deps.roundRepository.findActiveByShiftSession(session.id);
  if (activeRound) throw new RoundInProgressError();

  const site = await deps.siteRepository.findById(session.siteId);
  const exitQrCodeId = site?.exitQrCodeId;
  const exitQrCode = exitQrCodeId ? await deps.qrCodeRepository.findById(exitQrCodeId) : null;
  if (exitQrCode && isQrCodeConsumed(exitQrCode)) throw new ExitQrAlreadyUsedError();

  const now = deps.clockService.now();
  if (exitQrCode) await deps.qrCodeRepository.markUsed(exitQrCode.id, now);

  const updated: ShiftSession = { ...session, status: "completed", endedAt: now };
  await deps.shiftSessionRepository.update(updated);
  return updated;
}
