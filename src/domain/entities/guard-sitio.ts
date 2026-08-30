/**
 * Vista de un sitio para el rol guard (`GET /sitios/guard` en el backend).
 * A diferencia de `Marca`, `GuardMarca` nunca incluye `qrCodeId`: si el guard
 * pudiera leerlo, podría enviarlo directamente sin abrir nunca la cámara.
 */
export interface GuardMarca {
  readonly id: string;
  readonly nombre: string;
  readonly orden: number;
  readonly activo: boolean;
}

export interface GuardLocal {
  readonly id: string;
  readonly nombre: string;
}

export interface GuardSitio {
  readonly id: string;
  readonly nombre: string;
  readonly direccion: string;
  readonly marcas: GuardMarca[];
  readonly locales: GuardLocal[];
}
