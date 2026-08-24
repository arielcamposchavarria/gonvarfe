import type { Sitio } from "../entities/sitio";

export interface CreateSitioInput {
  nombre: string;
  direccion: string;
  marcas: string[];
}

export interface SitioRepository {
  findAll(): Promise<Sitio[]>;
  findById(id: string): Promise<Sitio | null>;
  create(input: CreateSitioInput): Promise<Sitio>;
  /** Retorna null si el sitio no existe. */
  addMarca(sitioId: string, nombre: string): Promise<Sitio | null>;
  /** Idempotente: si la marca ya tiene un qrCodeId, lo retorna sin regenerarlo. Retorna null si el sitio no existe. */
  generateMarcaQr(sitioId: string, marcaId: string): Promise<Sitio | null>;
}
