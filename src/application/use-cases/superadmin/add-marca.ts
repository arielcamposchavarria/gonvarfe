import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

export interface AddMarcaDeps {
  sitioRepository: SitioRepository;
}

export interface AddMarcaInput {
  sitioId: string;
  nombre: string;
}

export class SitioNotFoundError extends Error {
  constructor(sitioId: string) {
    super(`No se encontró el sitio "${sitioId}".`);
    this.name = "SitioNotFoundError";
  }
}

export async function addMarca({ sitioRepository }: AddMarcaDeps, input: AddMarcaInput): Promise<Sitio> {
  const sitio = await sitioRepository.addMarca(input.sitioId, input.nombre);
  if (!sitio) throw new SitioNotFoundError(input.sitioId);
  return sitio;
}
