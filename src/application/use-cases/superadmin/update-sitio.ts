import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";
import { SitioNotFoundError } from "./add-marca";

export interface UpdateSitioDeps {
  sitioRepository: SitioRepository;
}

export interface UpdateSitioInput {
  sitioId: string;
  nombre: string;
  direccion: string;
}

export async function updateSitio({ sitioRepository }: UpdateSitioDeps, input: UpdateSitioInput): Promise<Sitio> {
  const sitio = await sitioRepository.update(input.sitioId, { nombre: input.nombre, direccion: input.direccion });
  if (!sitio) throw new SitioNotFoundError(input.sitioId);
  return sitio;
}
