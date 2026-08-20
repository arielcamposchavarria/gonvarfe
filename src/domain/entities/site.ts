import type { Station } from "./station";

export interface Site {
  readonly id: string;
  name: string;
  address: string;
  isActive: boolean;
  readonly startQrCodeId: string;
  readonly exitQrCodeId: string;
  readonly stations: Station[];
  /** Locales/negocios que un visitante puede indicar en la bitácora de ingreso. */
  readonly visitingLocals: string[];
}
