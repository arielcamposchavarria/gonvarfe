export interface Marca {
  readonly id: string;
  readonly nombre: string;
  readonly qrCodeId: string | null;
}

export interface Sitio {
  readonly id: string;
  readonly nombre: string;
  readonly direccion: string;
  readonly activo: boolean;
  readonly marcas: Marca[];
}
