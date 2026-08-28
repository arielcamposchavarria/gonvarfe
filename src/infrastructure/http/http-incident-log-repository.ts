import type { IncidentLogRepository } from "@/domain/ports/incident-log-repository";
import type { IncidentLog } from "@/domain/entities/incident-log";
import { isIncidentType } from "@/domain/value-objects/incident-type";
import { getAccessToken } from "@/lib/auth/session";

interface BackendIncidentLog {
  id: string;
  turnoId: string;
  sitioId: string;
  guardiaId: string;
  ocurrioEn: string;
  tipoIncidente: string;
  detalleTipoIncidente: string | null;
  zonaUbicacion: string;
  descripcion: string;
  fotos: string[] | null;
  createdAt: string;
}

function mapIncidentLog(dto: BackendIncidentLog): IncidentLog {
  return {
    id: dto.id,
    sitioId: dto.sitioId,
    guardId: dto.guardiaId,
    occurredAt: new Date(dto.ocurrioEn),
    incidentType: isIncidentType(dto.tipoIncidente) ? dto.tipoIncidente : "Otro",
    incidentTypeDetail: dto.detalleTipoIncidente,
    locationZone: dto.zonaUbicacion,
    description: dto.descripcion,
    photoUrls: dto.fotos ?? [],
    createdAt: new Date(dto.createdAt),
  };
}

/** Adaptador HTTP del puerto `IncidentLogRepository` contra el backend real (gonvarbe). */
export function createHttpIncidentLogRepository(): IncidentLogRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async findBySite(siteId) {
      const res = await fetch(`${baseUrl}/bitacora/incidencias/sitio/${siteId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo obtener la bitácora de incidencias.");
      return ((await res.json()) as BackendIncidentLog[]).map(mapIncidentLog);
    },

    async findByGuard(guardId) {
      const res = await fetch(`${baseUrl}/bitacora/incidencias/guardia/${guardId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo obtener la bitácora de incidencias.");
      return ((await res.json()) as BackendIncidentLog[]).map(mapIncidentLog);
    },

    async create(log) {
      const res = await fetch(`${baseUrl}/bitacora/incidencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          ocurrioEn: log.occurredAt.toISOString(),
          tipoIncidente: log.incidentType,
          detalleTipoIncidente: log.incidentTypeDetail ?? undefined,
          zonaUbicacion: log.locationZone,
          descripcion: log.description,
          fotos: log.photoUrls.length > 0 ? log.photoUrls : undefined,
        }),
      });
      if (!res.ok) throw new Error("No se pudo registrar la incidencia.");
      return mapIncidentLog((await res.json()) as BackendIncidentLog);
    },
  };
}
