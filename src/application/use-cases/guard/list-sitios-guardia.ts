import type { GuardSitioRepository } from "@/domain/ports/guard-sitio-repository";
import type { GuardSitio } from "@/domain/entities/guard-sitio";

export interface ListSitiosGuardiaDeps {
  guardSitioRepository: GuardSitioRepository;
}

export async function listSitiosGuardia({ guardSitioRepository }: ListSitiosGuardiaDeps): Promise<GuardSitio[]> {
  return guardSitioRepository.findAll();
}
