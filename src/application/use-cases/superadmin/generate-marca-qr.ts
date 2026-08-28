import type { SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";
import { SitioNotFoundError } from "./add-marca";

export interface GenerateMarcaQrDeps {
  sitioRepository: SitioRepository;
}

export interface GenerateMarcaQrInput {
  sitioId: string;
  marcaId: string;
}

export async function generateMarcaQr({ sitioRepository }: GenerateMarcaQrDeps, input: GenerateMarcaQrInput): Promise<Sitio> {
  const sitio = await sitioRepository.generateMarcaQr(input.sitioId, input.marcaId);
  if (!sitio) throw new SitioNotFoundError(input.sitioId);
  return sitio;
}
