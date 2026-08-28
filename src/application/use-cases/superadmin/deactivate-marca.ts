import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";
import { SitioNotFoundError } from "./add-marca";

export interface DeactivateMarcaDeps {
  sitioRepository: SitioRepository;
}

export interface DeactivateMarcaInput {
  sitioId: string;
  marcaId: string;
}

export async function deactivateMarca(
  { sitioRepository }: DeactivateMarcaDeps,
  input: DeactivateMarcaInput,
): Promise<Sitio> {
  const sitio = await sitioRepository.deactivateMarca(input.sitioId, input.marcaId);
  if (!sitio) throw new SitioNotFoundError(input.sitioId);
  return sitio;
}
