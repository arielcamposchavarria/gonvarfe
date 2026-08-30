import type { GuardSitio } from "../entities/guard-sitio";

export interface GuardSitioRepository {
  /** GET /sitios/guard — sitios activos con marcas activas, nunca incluye qrCodeId. */
  findAll(): Promise<GuardSitio[]>;
}
