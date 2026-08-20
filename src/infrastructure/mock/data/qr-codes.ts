import type { QrCode } from "@/domain/entities/qr-code";

/**
 * El QR de "start" de cada sitio también sirve como QR de la estación 1.
 * El QR de "exit" es de un solo uso y marca la salida definitiva del guard.
 */
export const qrCodes: QrCode[] = [
  { id: "qr-start-site-1", siteId: "site-1", kind: "start", stationId: "station-1-1", singleUse: false, usedAt: null },
  { id: "qr-station-1-2", siteId: "site-1", kind: "station", stationId: "station-1-2", singleUse: false, usedAt: null },
  { id: "qr-station-1-3", siteId: "site-1", kind: "station", stationId: "station-1-3", singleUse: false, usedAt: null },
  { id: "qr-station-1-4", siteId: "site-1", kind: "station", stationId: "station-1-4", singleUse: false, usedAt: null },
  { id: "qr-station-1-5", siteId: "site-1", kind: "station", stationId: "station-1-5", singleUse: false, usedAt: null },
  { id: "qr-station-1-6", siteId: "site-1", kind: "station", stationId: "station-1-6", singleUse: false, usedAt: null },
  { id: "qr-station-1-7", siteId: "site-1", kind: "station", stationId: "station-1-7", singleUse: false, usedAt: null },
  { id: "qr-station-1-8", siteId: "site-1", kind: "station", stationId: "station-1-8", singleUse: false, usedAt: null },
  { id: "qr-station-1-9", siteId: "site-1", kind: "station", stationId: "station-1-9", singleUse: false, usedAt: null },
  { id: "qr-station-1-10", siteId: "site-1", kind: "station", stationId: "station-1-10", singleUse: false, usedAt: null },
  { id: "qr-station-1-11", siteId: "site-1", kind: "station", stationId: "station-1-11", singleUse: false, usedAt: null },
  { id: "qr-station-1-12", siteId: "site-1", kind: "station", stationId: "station-1-12", singleUse: false, usedAt: null },
  { id: "qr-exit-site-1", siteId: "site-1", kind: "exit", stationId: null, singleUse: true, usedAt: null },

  { id: "qr-start-site-2", siteId: "site-2", kind: "start", stationId: "station-2-1", singleUse: false, usedAt: null },
  { id: "qr-station-2-2", siteId: "site-2", kind: "station", stationId: "station-2-2", singleUse: false, usedAt: null },
  { id: "qr-station-2-3", siteId: "site-2", kind: "station", stationId: "station-2-3", singleUse: false, usedAt: null },
  { id: "qr-station-2-4", siteId: "site-2", kind: "station", stationId: "station-2-4", singleUse: false, usedAt: null },
  { id: "qr-exit-site-2", siteId: "site-2", kind: "exit", stationId: null, singleUse: true, usedAt: null },
];
