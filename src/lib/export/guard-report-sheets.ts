import type { SheetDefinition } from "./xlsx";
import type { RoundWithSite } from "@/application/use-cases/admin/list-guard-rounds";
import type { ScannedStationEntry } from "@/application/use-cases/admin/list-guard-scanned-stations";
import type { MissedScanEntry } from "@/application/use-cases/admin/list-guard-missed-scans";
import type { EntryLogWithSite } from "@/application/use-cases/admin/list-guard-entry-logs";
import type { IncidentLogWithSite } from "@/application/use-cases/admin/list-guard-incident-logs";
import type { RecorridoEstado } from "@/domain/entities/recorrido";

const ROUND_STATUS_LABEL: Record<RecorridoEstado, string> = {
  "en-progreso": "En curso",
  completado: "Completado",
};

export function buildGuardRoundsSheet(rounds: RoundWithSite[]): SheetDefinition {
  return {
    name: "Recorridos",
    columns: [
      { header: "Sitio", key: "site" },
      { header: "Recorrido #", key: "sequence", width: 14 },
      { header: "Estado", key: "status" },
      { header: "Iniciado", key: "startedAt" },
      { header: "Finalizado", key: "completedAt" },
      { header: "Estaciones escaneadas", key: "onTime", width: 20 },
      { header: "Estaciones no escaneadas", key: "missed", width: 22 },
    ],
    rows: rounds.map(({ recorrido, siteName }) => ({
      site: siteName,
      sequence: recorrido.secuencia,
      status: ROUND_STATUS_LABEL[recorrido.estado],
      startedAt: recorrido.iniciadoEn.toLocaleString(),
      completedAt: recorrido.completadoEn ? recorrido.completadoEn.toLocaleString() : "",
      onTime: recorrido.registros.filter((registro) => registro.estado === "a-tiempo").length,
      missed: recorrido.registros.filter((registro) => registro.estado === "perdido").length,
    })),
  };
}

export function buildGuardScannedStationsSheet(entries: ScannedStationEntry[]): SheetDefinition {
  return {
    name: "QR escaneados",
    columns: [
      { header: "Sitio", key: "site" },
      { header: "Estación", key: "station", width: 30 },
      { header: "Recorrido #", key: "round", width: 14 },
      { header: "Escaneado", key: "scannedAt" },
    ],
    rows: entries.map((entry) => ({
      site: entry.siteName,
      station: entry.stationName,
      round: entry.roundSequence,
      scannedAt: entry.scannedAt.toLocaleString(),
    })),
  };
}

export function buildGuardMissedScansSheet(entries: MissedScanEntry[]): SheetDefinition {
  return {
    name: "QR no escaneados",
    columns: [
      { header: "Sitio", key: "site" },
      { header: "Estación", key: "station", width: 30 },
      { header: "Recorrido #", key: "round", width: 14 },
      { header: "Reportado", key: "reportedAt" },
      { header: "Justificación", key: "reason", width: 40 },
    ],
    rows: entries.map((entry) => ({
      site: entry.siteName,
      station: entry.stationName,
      round: entry.roundSequence,
      reportedAt: entry.reportedAt.toLocaleString(),
      reason: entry.reason,
    })),
  };
}

export function buildGuardEntryLogsSheet(entries: EntryLogWithSite[]): SheetDefinition {
  return {
    name: "Bitácora de ingresos",
    columns: [
      { header: "Sitio", key: "site" },
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
    rows: entries.map(({ log, siteName }) => ({
      site: siteName,
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

export function buildGuardIncidentLogsSheet(entries: IncidentLogWithSite[]): SheetDefinition {
  return {
    name: "Bitácora de incidencias",
    columns: [
      { header: "Sitio", key: "site" },
      { header: "Fecha", key: "occurredAt" },
      { header: "Tipo", key: "incidentType", width: 26 },
      { header: "Zona", key: "locationZone", width: 24 },
      { header: "Descripción", key: "description", width: 40 },
      { header: "Fotos adjuntas", key: "photoCount", width: 14 },
    ],
    rows: entries.map(({ log, siteName }) => ({
      site: siteName,
      occurredAt: log.occurredAt.toLocaleString(),
      incidentType: log.incidentType === "Otro" && log.incidentTypeDetail ? log.incidentTypeDetail : log.incidentType,
      locationZone: log.locationZone,
      description: log.description,
      photoCount: log.photoUrls.length,
    })),
  };
}
