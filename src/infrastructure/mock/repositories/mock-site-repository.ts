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
  };
}
