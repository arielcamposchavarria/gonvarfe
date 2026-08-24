import type { SiteRepository } from "@/domain/ports/site-repository";
import type { Site } from "@/domain/entities/site";

export interface CreateSiteDeps {
  siteRepository: SiteRepository;
}

export interface CreateSiteInput {
  name: string;
  address: string;
  visitingLocals: string[];
}

export async function createSite(deps: CreateSiteDeps, input: CreateSiteInput): Promise<Site> {
  const id = crypto.randomUUID();

  const site: Site = {
    id,
    name: input.name,
    address: input.address,
    isActive: true,
    startQrCodeId: `qr-start-${id}`,
    exitQrCodeId: `qr-exit-${id}`,
    stations: [],
    visitingLocals: input.visitingLocals,
  };

  return deps.siteRepository.create(site);
}
