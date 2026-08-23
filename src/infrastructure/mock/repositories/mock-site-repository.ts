import type { SiteRepository } from "@/domain/ports/site-repository";
import { sites } from "../data/sites";

export function createMockSiteRepository(): SiteRepository {
  return {
    async findAll() {
      return sites;
    },
    async findById(id) {
      return sites.find((site) => site.id === id) ?? null;
    },
    async create(site) {
      sites.push(site);
      return site;
    },
    async addVisitingLocal(siteId, local) {
      const site = sites.find((s) => s.id === siteId);
      if (!site) return null;
      site.visitingLocals.push(local);
      return site;
    },
  };
}
