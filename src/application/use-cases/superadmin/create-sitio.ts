import type { CreateSitioInput, SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

export interface CreateSitioDeps {
  sitioRepository: SitioRepository;
}

export async function createSitio({ sitioRepository }: CreateSitioDeps, input: CreateSitioInput): Promise<Sitio> {
  return sitioRepository.create(input);
}
