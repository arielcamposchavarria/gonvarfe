import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";

export interface ListSitesDeps {
  siteRepository: SiteRepository;
}

export async function listSites({ siteRepository }: ListSitesDeps): Promise<Site[]> {
  return siteRepository.findAll();
}
