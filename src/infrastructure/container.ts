import { createHttpSitioRepository } from "./http/http-sitio-repository";
import { createHttpUserRepository } from "./http/http-user-repository";
import { createHttpAuthService } from "./http/http-auth-service";
import { createHttpRoleRepository } from "./http/http-role-repository";
import { createHttpGuardSitioRepository } from "./http/http-guard-sitio-repository";
import { createHttpTurnoRepository } from "./http/http-turno-repository";
import { createHttpRecorridoRepository } from "./http/http-recorrido-repository";
import { createHttpEntryLogRepository } from "./http/http-entry-log-repository";
import { createHttpIncidentLogRepository } from "./http/http-incident-log-repository";

import { authenticateUser, type AuthenticateUserInput } from "@/application/use-cases/auth/authenticate-user";
import { listSitiosGuardia } from "@/application/use-cases/guard/list-sitios-guardia";
import { iniciarTurno } from "@/application/use-cases/guard/iniciar-turno";
import { finalizarTurno } from "@/application/use-cases/guard/finalizar-turno";
import { obtenerEstadoTurno } from "@/application/use-cases/guard/obtener-estado-turno";
import { registrarEscaneo } from "@/application/use-cases/guard/registrar-escaneo";
import { reportarPerdido } from "@/application/use-cases/guard/reportar-perdido";
import { submitEntryLog, type SubmitEntryLogInput } from "@/application/use-cases/guard/submit-entry-log";
import { submitIncidentLog, type SubmitIncidentLogInput } from "@/application/use-cases/guard/submit-incident-log";
import { listGuards } from "@/application/use-cases/admin/list-guards";
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
import { updateSitio, type UpdateSitioInput as UpdateSitioUseCaseInput } from "@/application/use-cases/superadmin/update-sitio";
import { deactivateSitio } from "@/application/use-cases/superadmin/deactivate-sitio";
import { addMarca, type AddMarcaInput } from "@/application/use-cases/superadmin/add-marca";
import { generateMarcaQr, type GenerateMarcaQrInput } from "@/application/use-cases/superadmin/generate-marca-qr";
import { updateMarca, type UpdateMarcaInput } from "@/application/use-cases/superadmin/update-marca";
import { deactivateMarca, type DeactivateMarcaInput } from "@/application/use-cases/superadmin/deactivate-marca";
import { createLocal, type CreateLocalInput } from "@/application/use-cases/admin/create-local";
import { createUser } from "@/application/use-cases/superadmin/create-user";
import { listRoles } from "@/application/use-cases/superadmin/list-roles";
import type { CreateSitioInput } from "@/domain/ports/sitio-repository";
import type { CreateUserInput } from "@/domain/ports/user-repository";
import type { EscanearInput, ReportarPerdidoInput } from "@/domain/ports/recorrido-repository";
import type { DateRange } from "@/lib/date-range";

/**
 * Composition root: único lugar donde se conectan los casos de uso con
 * adaptadores concretos. Todos los repositorios están respaldados por el
 * backend real (gonvarbe) — no quedan adaptadores mock.
 */
const sitioRepository = createHttpSitioRepository();
/** Usuarios, roles y autenticación reales contra el backend (gonvarbe). */
const userRepository = createHttpUserRepository();
const roleRepository = createHttpRoleRepository();
const authService = createHttpAuthService();
/**
 * Vista de sitios para el rol guard (`GET /sitios/guard`): nunca incluye
 * `qrCodeId`, a diferencia de `sitioRepository` (usado por admin/superAdmin).
 */
const guardSitioRepository = createHttpGuardSitioRepository();
const turnoRepository = createHttpTurnoRepository();
const recorridoRepository = createHttpRecorridoRepository();
const entryLogRepository = createHttpEntryLogRepository();
const incidentLogRepository = createHttpIncidentLogRepository();

export const container = {
  authenticateUser: (input: AuthenticateUserInput) => authenticateUser({ authService }, input),

  listSitiosParaGuardia: () => listSitiosGuardia({ guardSitioRepository }),
  iniciarTurno: (sitioId: string) => iniciarTurno({ turnoRepository }, sitioId),
  finalizarTurno: () => finalizarTurno({ turnoRepository }),
  obtenerEstadoTurno: () => obtenerEstadoTurno({ turnoRepository, recorridoRepository, guardSitioRepository }),
  registrarEscaneo: (input: EscanearInput) => registrarEscaneo({ recorridoRepository }, input),
  reportarPerdido: (input: ReportarPerdidoInput) => reportarPerdido({ recorridoRepository }, input),

  submitEntryLog: (input: SubmitEntryLogInput) => submitEntryLog({ entryLogRepository }, input),
  submitIncidentLog: (input: SubmitIncidentLogInput) => submitIncidentLog({ incidentLogRepository }, input),

  listGuards: () => listGuards({ userRepository }),
  createUser: (input: CreateUserInput) => createUser({ userRepository }, input),
  listRoles: () => listRoles({ roleRepository }),
  listUsers: () => listUsers({ userRepository }),
  listSitios: () => listSitios({ sitioRepository }),
  getSitio: (sitioId: string) => getSitio({ sitioRepository }, sitioId),
  createSitio: (input: CreateSitioInput) => createSitio({ sitioRepository }, input),
  updateSitio: (input: UpdateSitioUseCaseInput) => updateSitio({ sitioRepository }, input),
  deactivateSitio: (sitioId: string) => deactivateSitio({ sitioRepository }, sitioId),
  addMarca: (input: AddMarcaInput) => addMarca({ sitioRepository }, input),
  generateMarcaQr: (input: GenerateMarcaQrInput) => generateMarcaQr({ sitioRepository }, input),
  updateMarca: (input: UpdateMarcaInput) => updateMarca({ sitioRepository }, input),
  deactivateMarca: (input: DeactivateMarcaInput) => deactivateMarca({ sitioRepository }, input),
  createLocal: (input: CreateLocalInput) => createLocal({ sitioRepository }, input),

  listRoundsBySite: (siteId: string) => listRoundsBySite({ recorridoRepository, turnoRepository, userRepository }, siteId),
  getRoundDetail: (siteId: string, roundId: string) =>
    getRoundDetail({ recorridoRepository, turnoRepository, sitioRepository, userRepository }, siteId, roundId),
  listEntryLogsBySite: (siteId: string) => listEntryLogsBySite({ entryLogRepository, userRepository }, siteId),
  listIncidentLogsBySite: (siteId: string) =>
    listIncidentLogsBySite({ incidentLogRepository, userRepository }, siteId),

  getGuardDetail: (guardId: string) =>
    getGuardDetail(
      { userRepository, sitioRepository, turnoRepository, recorridoRepository, entryLogRepository, incidentLogRepository },
      guardId,
    ),
  listGuardMissedScans: (guardId: string, range?: DateRange) =>
    listGuardMissedScans({ turnoRepository, recorridoRepository, sitioRepository }, guardId, range),
  listGuardEntryLogs: (guardId: string, range?: DateRange) =>
    listGuardEntryLogs({ entryLogRepository, sitioRepository }, guardId, range),
  listGuardIncidentLogs: (guardId: string, range?: DateRange) =>
    listGuardIncidentLogs({ incidentLogRepository, sitioRepository }, guardId, range),
  listGuardRounds: (guardId: string, range?: DateRange) =>
    listGuardRounds({ turnoRepository, recorridoRepository, sitioRepository }, guardId, range),
  listGuardScannedStations: (guardId: string, range?: DateRange) =>
    listGuardScannedStations({ turnoRepository, recorridoRepository, sitioRepository }, guardId, range),

  findUserById: (id: string) => userRepository.findById(id),
};

// Se exponen para casos donde se necesite un repo crudo fuera de un caso de uso ya envuelto arriba.
export const repositories = {
  sitioRepository,
  userRepository,
  guardSitioRepository,
  turnoRepository,
  recorridoRepository,
  entryLogRepository,
  incidentLogRepository,
};
