import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";
import { SitioNotFoundError } from "./add-marca";

export interface UpdateMarcaDeps {
  sitioRepository: SitioRepository;
}

export interface UpdateMarcaInput {
  sitioId: string;
  marcaId: string;
  nombre: string;
}

export async function updateMarca({ sitioRepository }: UpdateMarcaDeps, input: UpdateMarcaInput): Promise<Sitio> {
  const sitio = await sitioRepository.updateMarca(input.sitioId, input.marcaId, input.nombre);
  if (!sitio) throw new SitioNotFoundError(input.sitioId);
  return sitio;
}
