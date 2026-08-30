import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";
import { SitioNotFoundError } from "./add-marca";

export interface DeactivateSitioDeps {
  sitioRepository: SitioRepository;
}

export async function deactivateSitio({ sitioRepository }: DeactivateSitioDeps, sitioId: string): Promise<Sitio> {
  const sitio = await sitioRepository.deactivate(sitioId);
  if (!sitio) throw new SitioNotFoundError(sitioId);
  return sitio;
}
