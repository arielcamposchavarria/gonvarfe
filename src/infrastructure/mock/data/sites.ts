import type { Site } from "@/domain/entities/site";
import type { Station } from "@/domain/entities/station";

/** Recorrido real de Plaza Amara: 12 marcas repartidas en 1 hora (5 min cada una). */
const site1Stations: Station[] = [
  { id: "station-1-1", siteId: "site-1", name: "Esquina del BAC", order: 1, qrCodeId: "qr-start-site-1" },
  {
    id: "station-1-2",
    siteId: "site-1",
    name: "Estacionamientos para vehículos eléctricos",
    order: 2,
    qrCodeId: "qr-station-1-2",
  },
  {
    id: "station-1-3",
    siteId: "site-1",
    name: "Estacionamiento destinado al área de carga y descarga",
    order: 3,
    qrCodeId: "qr-station-1-3",
  },
  {
    id: "station-1-4",
    siteId: "site-1",
    name: "Pared de la oficina de Administración",
    order: 4,
    qrCodeId: "qr-station-1-4",
  },
  {
    id: "station-1-5",
    siteId: "site-1",
    name: "Estacionamientos para personas con discapacidad",
    order: 5,
    qrCodeId: "qr-station-1-5",
  },
  {
    id: "station-1-6",
    siteId: "site-1",
    name: "Estacionamiento de motocicletas ubicado al lado del MEP",
    order: 6,
    qrCodeId: "qr-station-1-6",
  },
  { id: "station-1-7", siteId: "site-1", name: "Área del basurero", order: 7, qrCodeId: "qr-station-1-7" },
  {
    id: "station-1-8",
    siteId: "site-1",
    name: "Estacionamiento ubicado fuera del área asignada al MEP",
    order: 8,
    qrCodeId: "qr-station-1-8",
  },
  {
    id: "station-1-9",
    siteId: "site-1",
    name: "Salida de la plaza por el lado de KFC",
    order: 9,
    qrCodeId: "qr-station-1-9",
  },
  {
    id: "station-1-10",
    siteId: "site-1",
    name: "Área central de la plaza, donde se apaga el abanico industrial",
    order: 10,
    qrCodeId: "qr-station-1-10",
  },
  {
    id: "station-1-11",
    siteId: "site-1",
    name: "Área de AutoKing de Burger King (BK)",
    order: 11,
    qrCodeId: "qr-station-1-11",
  },
  {
    id: "station-1-12",
    siteId: "site-1",
    name: "Entrada principal de la plaza",
    order: 12,
    qrCodeId: "qr-station-1-12",
  },
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
    name: "Plaza Amara",
    address: "Dirección pendiente",
    isActive: true,
    startQrCodeId: "qr-start-site-1",
    exitQrCodeId: "qr-exit-site-1",
    stations: site1Stations,
    visitingLocals: [
      "BANCO BAC SAN JOSE SA",
      "SELTHER CR SA",
      "READY PIZZA RP SRL",
      "BELLAS",
      "DISTRIBUIDORA CARNES SAN MARTIN SA",
      "BUERGER KING",
      "CORREAS AMERICANAS S y J",
      "KOAJ",
      "COOPEANDE",
      "POPS",
      "NATIVO",
      "PERSIANAS CANET SOCIEDAD ANONIMA",
      "KOTOY",
      "MEP",
      "KIOSKO",
      "Otro",
    ],
  },
  {
    id: "site-2",
    name: "Planta Industrial Norte",
    address: "Parque Industrial, Barreal, Heredia",
    isActive: true,
    startQrCodeId: "qr-start-site-2",
    exitQrCodeId: "qr-exit-site-2",
    stations: site2Stations,
    visitingLocals: ["Recepción", "Bodega", "Oficinas administrativas", "Otro"],
  },
];
