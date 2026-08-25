import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

export interface CreateLocalDeps {
  sitioRepository: SitioRepository;
}

export interface CreateLocalInput {
  sitioId: string;
  nombre: string;
}

export class SitioNotFoundError extends Error {
  constructor(sitioId: string) {
    super(`No se encontró el sitio "${sitioId}".`);
    this.name = "SitioNotFoundError";
  }
}

export async function createLocal({ sitioRepository }: CreateLocalDeps, input: CreateLocalInput): Promise<Sitio> {
  const sitio = await sitioRepository.createLocal(input.sitioId, input.nombre);
  if (!sitio) throw new SitioNotFoundError(input.sitioId);
  return sitio;
}
