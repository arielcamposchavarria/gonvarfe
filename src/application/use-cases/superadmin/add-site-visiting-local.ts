import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";

export interface AddSiteVisitingLocalDeps {
  siteRepository: SiteRepository;
}

export interface AddSiteVisitingLocalInput {
  siteId: string;
  local: string;
}

export class SiteNotFoundError extends Error {
  constructor(siteId: string) {
    super(`No se encontró el sitio "${siteId}".`);
    this.name = "SiteNotFoundError";
  }
}

/** Agrega una marca/local a la lista de locales visitables de un sitio. */
export async function addSiteVisitingLocal(deps: AddSiteVisitingLocalDeps, input: AddSiteVisitingLocalInput): Promise<Site> {
  const site = await deps.siteRepository.addVisitingLocal(input.siteId, input.local);
  if (!site) throw new SiteNotFoundError(input.siteId);
  return site;
}
