import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";
import type { EntryLog } from "@/domain/entities/entry-log";
import { createCedula, type Cedula } from "@/domain/value-objects/cedula";
import { createPlateNumber, type PlateNumber } from "@/domain/value-objects/plate-number";
import { getAccessToken } from "@/lib/auth/session";

interface BackendEntryLog {
  id: string;
  turnoId: string;
  sitioId: string;
  guardiaId: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  placa: string;
  nombreConductor: string;
  cedula: string;
  empresa: string;
  motivo: string;
  localVisitado: string;
  observaciones: string | null;
  fotos: string[] | null;
  createdAt: string;
}

// El backend no impone el formato estricto de placa/cédula (solo largo
// máximo): un registro legado o creado fuera del formulario del guard puede
// no calzar con el value object. No dejar que eso tumbe el reporte completo.
function safePlateNumber(value: string): PlateNumber {
  try {
    return createPlateNumber(value);
  } catch {
    return value.trim().toUpperCase() as PlateNumber;
  }
}

function safeCedula(value: string): Cedula {
  try {
    return createCedula(value);
  } catch {
    return value.trim() as Cedula;
  }
}

function mapEntryLog(dto: BackendEntryLog): EntryLog {
  return {
    id: dto.id,
    sitioId: dto.sitioId,
    guardId: dto.guardiaId,
    date: dto.fecha,
    entryTime: dto.horaEntrada,
    exitTime: dto.horaSalida,
    plate: safePlateNumber(dto.placa),
    driverName: dto.nombreConductor,
    cedula: safeCedula(dto.cedula),
    company: dto.empresa,
    reason: dto.motivo,
    visitingLocal: dto.localVisitado,
    observations: dto.observaciones ?? "",
    photoUrls: dto.fotos ?? [],
    createdAt: new Date(dto.createdAt),
  };
}

/** Adaptador HTTP del puerto `EntryLogRepository` contra el backend real (gonvarbe). */
export function createHttpEntryLogRepository(): EntryLogRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async findBySite(siteId) {
      const res = await fetch(`${baseUrl}/bitacora/ingresos/sitio/${siteId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo obtener la bitácora de ingresos.");
      return ((await res.json()) as BackendEntryLog[]).map(mapEntryLog);
    },

    async findByGuard(guardId) {
      const res = await fetch(`${baseUrl}/bitacora/ingresos/guardia/${guardId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo obtener la bitácora de ingresos.");
      return ((await res.json()) as BackendEntryLog[]).map(mapEntryLog);
    },

    async create(log) {
      const res = await fetch(`${baseUrl}/bitacora/ingresos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          fecha: log.date,
          horaEntrada: log.entryTime,
          horaSalida: log.exitTime,
          placa: log.plate,
          nombreConductor: log.driverName,
          cedula: log.cedula,
          empresa: log.company,
          motivo: log.reason,
          localVisitado: log.visitingLocal,
          observaciones: log.observations || undefined,
          fotos: log.photoUrls.length > 0 ? log.photoUrls : undefined,
        }),
      });
      if (!res.ok) throw new Error("No se pudo registrar el ingreso.");
      return mapEntryLog((await res.json()) as BackendEntryLog);
    },
  };
}
