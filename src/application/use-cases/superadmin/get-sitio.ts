import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

export interface GetSitioDeps {
  sitioRepository: SitioRepository;
}

export async function getSitio({ sitioRepository }: GetSitioDeps, sitioId: string): Promise<Sitio | null> {
  return sitioRepository.findById(sitioId);
}
