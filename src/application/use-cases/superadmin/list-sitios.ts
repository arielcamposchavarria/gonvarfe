import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

export interface ListSitiosDeps {
  sitioRepository: SitioRepository;
}

export async function listSitios({ sitioRepository }: ListSitiosDeps): Promise<Sitio[]> {
  return sitioRepository.findAll();
}
