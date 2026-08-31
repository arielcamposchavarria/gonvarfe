import type { SheetDefinition } from "./xlsx";
import type { RoundWithGuard } from "@/application/use-cases/admin/list-rounds-by-site";
import type { EntryLogWithGuard } from "@/application/use-cases/admin/list-entry-logs-by-site";
import type { IncidentLogWithGuard } from "@/application/use-cases/admin/list-incident-logs-by-site";
import type { RecorridoEstado } from "@/domain/entities/recorrido";

const ROUND_STATUS_LABEL: Record<RecorridoEstado, string> = {
  "en-progreso": "En curso",
  completado: "Completado",
};

/** Espejo de buildGuardRoundsSheet, pero con columna "Guarda" en vez de "Sitio" (ya escopado a un sitio). */
export function buildSiteRoundsSheet(rounds: RoundWithGuard[]): SheetDefinition {
  return {
    name: "Recorridos",
    columns: [
      { header: "Guarda", key: "guard", width: 26 },
      { header: "Turno iniciado", key: "turnoStartedAt", width: 20 },
      { header: "Recorrido #", key: "sequence", width: 14 },
      { header: "Estado", key: "status" },
      { header: "Iniciado", key: "startedAt" },
      { header: "Finalizado", key: "completedAt" },
      { header: "Estaciones escaneadas", key: "onTime", width: 20 },
      { header: "Estaciones no escaneadas", key: "missed", width: 22 },
    ],
    rows: rounds.map(({ recorrido, guardName, turnoIniciadoEn }) => ({
      guard: guardName,
      turnoStartedAt: turnoIniciadoEn.toLocaleString(),
      sequence: recorrido.secuencia,
      status: ROUND_STATUS_LABEL[recorrido.estado],
      startedAt: recorrido.iniciadoEn.toLocaleString(),
      completedAt: recorrido.completadoEn ? recorrido.completadoEn.toLocaleString() : "",
      onTime: recorrido.registros.filter((registro) => registro.estado === "a-tiempo").length,
      missed: recorrido.registros.filter((registro) => registro.estado === "perdido").length,
    })),
  };
}

export function buildSiteEntryLogsSheet(entries: EntryLogWithGuard[]): SheetDefinition {
  return {
    name: "Bitácora de ingresos",
    columns: [
      { header: "Guarda", key: "guard", width: 26 },
      { header: "Fecha", key: "date" },
      { header: "Hora de ingreso", key: "entryTime" },
      { header: "Hora de salida", key: "exitTime" },
      { header: "Conductor", key: "driverName", width: 26 },
      { header: "Cédula", key: "cedula" },
      { header: "Placa", key: "plate" },
      { header: "Empresa", key: "company", width: 26 },
      { header: "Motivo", key: "reason", width: 30 },
      { header: "Local visitado", key: "visitingLocal", width: 24 },
      { header: "Observaciones", key: "observations", width: 30 },
      { header: "Fotos adjuntas", key: "photoCount", width: 14 },
    ],
    rows: entries.map(({ log, guardName }) => ({
      guard: guardName,
      date: log.date,
      entryTime: log.entryTime,
      exitTime: log.exitTime,
      driverName: log.driverName,
      cedula: log.cedula,
      plate: log.plate,
      company: log.company,
      reason: log.reason,
      visitingLocal: log.visitingLocal,
      observations: log.observations,
      photoCount: log.photoUrls.length,
    })),
  };
}

export function buildSiteIncidentLogsSheet(entries: IncidentLogWithGuard[]): SheetDefinition {
  return {
    name: "Bitácora de incidencias",
    columns: [
      { header: "Guarda", key: "guard", width: 26 },
      { header: "Fecha", key: "occurredAt" },
      { header: "Tipo", key: "incidentType", width: 26 },
      { header: "Zona", key: "locationZone", width: 24 },
      { header: "Descripción", key: "description", width: 40 },
      { header: "Fotos adjuntas", key: "photoCount", width: 14 },
    ],
    rows: entries.map(({ log, guardName }) => ({
      guard: guardName,
      occurredAt: log.occurredAt.toLocaleString(),
      incidentType: log.incidentType === "Otro" && log.incidentTypeDetail ? log.incidentTypeDetail : log.incidentType,
      locationZone: log.locationZone,
      description: log.description,
      photoCount: log.photoUrls.length,
    })),
  };
}
