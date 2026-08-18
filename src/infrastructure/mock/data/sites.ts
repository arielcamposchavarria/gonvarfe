import type { Site } from "@/domain/entities/site";
import type { Station } from "@/domain/entities/station";

const site1Stations: Station[] = [
  { id: "station-1-1", siteId: "site-1", name: "Entrada principal", order: 1, qrCodeId: "qr-start-site-1" },
  { id: "station-1-2", siteId: "site-1", name: "Bodega norte", order: 2, qrCodeId: "qr-station-1-2" },
  { id: "station-1-3", siteId: "site-1", name: "Bodega sur", order: 3, qrCodeId: "qr-station-1-3" },
  { id: "station-1-4", siteId: "site-1", name: "Parqueo", order: 4, qrCodeId: "qr-station-1-4" },
];

const site2Stations: Station[] = [
  { id: "station-2-1", siteId: "site-2", name: "Portón de acceso", order: 1, qrCodeId: "qr-start-site-2" },
  { id: "station-2-2", siteId: "site-2", name: "Planta de producción", order: 2, qrCodeId: "qr-station-2-2" },
  { id: "station-2-3", siteId: "site-2", name: "Bodega de materia prima", order: 3, qrCodeId: "qr-station-2-3" },
  { id: "station-2-4", siteId: "site-2", name: "Zona de carga", order: 4, qrCodeId: "qr-station-2-4" },
];

export const sites: Site[] = [
  {
    id: "site-1",
    name: "Bodega Central GonVar",
    address: "Zona Industrial, La Uruca, San José",
    isActive: true,
    startQrCodeId: "qr-start-site-1",
    exitQrCodeId: "qr-exit-site-1",
    stations: site1Stations,
  },
  {
    id: "site-2",
    name: "Planta Industrial Norte",
    address: "Parque Industrial, Barreal, Heredia",
    isActive: true,
    startQrCodeId: "qr-start-site-2",
    exitQrCodeId: "qr-exit-site-2",
    stations: site2Stations,
  },
];
