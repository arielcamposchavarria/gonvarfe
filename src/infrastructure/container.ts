import { createMockSiteRepository } from "./mock/repositories/mock-site-repository";
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
import { listSites } from "@/application/use-cases/admin/list-sites";
import { listGuards } from "@/application/use-cases/admin/list-guards";
import { listUsers } from "@/application/use-cases/superadmin/list-users";
import type { GuardUser } from "@/domain/entities/user";

/**
 * Composition root: único lugar donde se conectan los casos de uso con
 * adaptadores concretos. Al conectar un backend real, solo este archivo
 * cambia (se reemplazan los `createMock*` por adaptadores reales).
 */
const siteRepository = createMockSiteRepository();
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

  listSites: () => listSites({ siteRepository }),
  listGuards: () => listGuards({ userRepository }),
  listUsers: () => listUsers({ userRepository }),

  findUserById: (id: string) => userRepository.findById(id),
};

// Se exponen para casos donde el composition root necesita repos crudos (p.ej. entry/incident logs
// en la siguiente fase, cuando se implementen sus casos de uso).
export const repositories = {
  siteRepository,
  userRepository,
  shiftSessionRepository,
  roundRepository,
  qrCodeRepository,
  entryLogRepository,
  incidentLogRepository,
};
