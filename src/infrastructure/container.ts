import { createMockSiteRepository } from "./mock/repositories/mock-site-repository";
import { createHttpSitioRepository } from "./http/http-sitio-repository";
import { createMockUserRepository } from "./mock/repositories/mock-user-repository";
import { createMockShiftSessionRepository } from "./mock/repositories/mock-shift-session-repository";
import { createMockRoundRepository } from "./mock/repositories/mock-round-repository";
import { createMockQrCodeRepository } from "./mock/repositories/mock-qr-code-repository";
import { createMockEntryLogRepository } from "./mock/repositories/mock-entry-log-repository";
import { createMockIncidentLogRepository } from "./mock/repositories/mock-incident-log-repository";
import { createMockAuthService } from "./mock/services/mock-auth-service";
import { createSystemClockService } from "./mock/services/system-clock-service";

import { authenticateUser, type AuthenticateUserInput } from "@/application/use-cases/auth/authenticate-user";
import { startShift } from "@/application/use-cases/guard/start-shift";
import { scanStation, type ScanStationInput } from "@/application/use-cases/guard/scan-station";
import { endShift } from "@/application/use-cases/guard/end-shift";
import { reportMissedScan, type ReportMissedScanInput } from "@/application/use-cases/guard/report-missed-scan";
import { getShiftStatus } from "@/application/use-cases/guard/get-shift-status";
import { submitEntryLog, type SubmitEntryLogInput } from "@/application/use-cases/guard/submit-entry-log";
import { submitIncidentLog, type SubmitIncidentLogInput } from "@/application/use-cases/guard/submit-incident-log";
import { listSites } from "@/application/use-cases/admin/list-sites";
import { listGuards } from "@/application/use-cases/admin/list-guards";
import { createGuard, type CreateGuardInput } from "@/application/use-cases/admin/create-guard";
import { getSite } from "@/application/use-cases/admin/get-site";
import { listRoundsBySite } from "@/application/use-cases/admin/list-rounds-by-site";
import { getRoundDetail } from "@/application/use-cases/admin/get-round-detail";
import { listEntryLogsBySite } from "@/application/use-cases/admin/list-entry-logs-by-site";
import { listIncidentLogsBySite } from "@/application/use-cases/admin/list-incident-logs-by-site";
import { getGuardDetail } from "@/application/use-cases/admin/get-guard-detail";
import { listGuardMissedScans } from "@/application/use-cases/admin/list-guard-missed-scans";
import { listGuardEntryLogs } from "@/application/use-cases/admin/list-guard-entry-logs";
import { listGuardIncidentLogs } from "@/application/use-cases/admin/list-guard-incident-logs";
import { listGuardRounds } from "@/application/use-cases/admin/list-guard-rounds";
import { listGuardScannedStations } from "@/application/use-cases/admin/list-guard-scanned-stations";
import { listUsers } from "@/application/use-cases/superadmin/list-users";
import { listSitios } from "@/application/use-cases/superadmin/list-sitios";
import { getSitio } from "@/application/use-cases/superadmin/get-sitio";
import { createSitio } from "@/application/use-cases/superadmin/create-sitio";
import { addMarca, type AddMarcaInput } from "@/application/use-cases/superadmin/add-marca";
import { generateMarcaQr, type GenerateMarcaQrInput } from "@/application/use-cases/superadmin/generate-marca-qr";
import type { CreateSitioInput } from "@/domain/ports/sitio-repository";
import type { GuardUser } from "@/domain/entities/user";
import type { DateRange } from "@/lib/date-range";

/**
 * Composition root: único lugar donde se conectan los casos de uso con
 * adaptadores concretos. Al conectar un backend real, solo este archivo
 * cambia (se reemplazan los `createMock*` por adaptadores reales).
 */
const siteRepository = createMockSiteRepository();
/**
 * Repositorio de sitios/marcas de superAdmin, respaldado por el backend real
 * (gonvarbe). Deliberadamente separado del `siteRepository` mock de arriba:
 * ese sigue modelando estaciones/QR de recorrido para guardia/admin/rondas,
 * un concepto distinto que el backend real todavía no implementa.
 */
const sitioRepository = createHttpSitioRepository();
const userRepository = createMockUserRepository();
const shiftSessionRepository = createMockShiftSessionRepository();
const roundRepository = createMockRoundRepository();
const qrCodeRepository = createMockQrCodeRepository();
const entryLogRepository = createMockEntryLogRepository();
const incidentLogRepository = createMockIncidentLogRepository();
const authService = createMockAuthService(userRepository);
const clockService = createSystemClockService();

export const container = {
  authenticateUser: (input: AuthenticateUserInput) => authenticateUser({ authService }, input),

  startShift: (guard: GuardUser) =>
    startShift({ shiftSessionRepository, roundRepository, siteRepository, clockService }, guard),

  scanStation: (input: ScanStationInput) =>
    scanStation({ shiftSessionRepository, roundRepository, siteRepository, clockService }, input),

  endShift: (guardId: string) =>
    endShift({ shiftSessionRepository, roundRepository, siteRepository, qrCodeRepository, clockService }, guardId),

  reportMissedScan: (input: ReportMissedScanInput) =>
    reportMissedScan({ shiftSessionRepository, roundRepository, clockService }, input),

  getShiftStatus: (siteId: string, guardId: string) =>
    getShiftStatus({ shiftSessionRepository, roundRepository, siteRepository }, siteId, guardId),

  submitEntryLog: (input: SubmitEntryLogInput) => submitEntryLog({ entryLogRepository }, input),
  submitIncidentLog: (input: SubmitIncidentLogInput) => submitIncidentLog({ incidentLogRepository }, input),

  listSites: () => listSites({ siteRepository }),
  listGuards: () => listGuards({ userRepository }),
  createGuard: (input: CreateGuardInput) => createGuard({ userRepository, authService }, input),
  listUsers: () => listUsers({ userRepository }),
  listSitios: () => listSitios({ sitioRepository }),
  getSitio: (sitioId: string) => getSitio({ sitioRepository }, sitioId),
  createSitio: (input: CreateSitioInput) => createSitio({ sitioRepository }, input),
  addMarca: (input: AddMarcaInput) => addMarca({ sitioRepository }, input),
  generateMarcaQr: (input: GenerateMarcaQrInput) => generateMarcaQr({ sitioRepository }, input),

  getSite: (siteId: string) => getSite({ siteRepository }, siteId),
  listRoundsBySite: (siteId: string) =>
    listRoundsBySite({ roundRepository, shiftSessionRepository, userRepository }, siteId),
  getRoundDetail: (siteId: string, roundId: string) =>
    getRoundDetail({ roundRepository, shiftSessionRepository, siteRepository, userRepository }, siteId, roundId),
  listEntryLogsBySite: (siteId: string) => listEntryLogsBySite({ entryLogRepository, userRepository }, siteId),
  listIncidentLogsBySite: (siteId: string) =>
    listIncidentLogsBySite({ incidentLogRepository, userRepository }, siteId),

  getGuardDetail: (guardId: string) =>
    getGuardDetail(
      { userRepository, siteRepository, shiftSessionRepository, roundRepository, entryLogRepository, incidentLogRepository },
      guardId,
    ),
  listGuardMissedScans: (guardId: string, range?: DateRange) =>
    listGuardMissedScans({ roundRepository, shiftSessionRepository, siteRepository }, guardId, range),
  listGuardEntryLogs: (guardId: string, range?: DateRange) =>
    listGuardEntryLogs({ entryLogRepository, siteRepository }, guardId, range),
  listGuardIncidentLogs: (guardId: string, range?: DateRange) =>
    listGuardIncidentLogs({ incidentLogRepository, siteRepository }, guardId, range),
  listGuardRounds: (guardId: string, range?: DateRange) =>
    listGuardRounds({ shiftSessionRepository, roundRepository, siteRepository }, guardId, range),
  listGuardScannedStations: (guardId: string, range?: DateRange) =>
    listGuardScannedStations({ shiftSessionRepository, roundRepository, siteRepository }, guardId, range),

  findUserById: (id: string) => userRepository.findById(id),
};

// Se exponen para casos donde se necesite un repo crudo fuera de un caso de uso ya envuelto arriba.
export const repositories = {
  siteRepository,
  userRepository,
  shiftSessionRepository,
  roundRepository,
  qrCodeRepository,
  entryLogRepository,
  incidentLogRepository,
};
