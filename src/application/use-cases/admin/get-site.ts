import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";

export interface GetSiteDeps {
  siteRepository: SiteRepository;
}

export async function getSite({ siteRepository }: GetSiteDeps, siteId: string): Promise<Site | null> {
  return siteRepository.findById(siteId);
}
