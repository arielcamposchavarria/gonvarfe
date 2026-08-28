export interface Marca {
  readonly id: string;
  readonly nombre: string;
  /** Posición fija del recorrido, asignada por el backend al crear la marca (1, 2, 3...). Inmutable. */
  readonly orden: number;
  readonly qrCodeId: string | null;
  readonly activo: boolean;
}

/** Local comercial dentro de un sitio, distinto de una marca: sin QR, lo crea el rol admin. */
export interface Local {
  readonly id: string;
  readonly nombre: string;
}

export interface Sitio {
  readonly id: string;
  readonly nombre: string;
  readonly direccion: string;
  readonly activo: boolean;
  readonly marcas: Marca[];
  readonly locales: Local[];
}
