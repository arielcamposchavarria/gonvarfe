import type { Site } from "../entities/site";

export interface SiteRepository {
  findAll(): Promise<Site[]>;
  findById(id: string): Promise<Site | null>;
  create(site: Site): Promise<Site>;
  /** Agrega una marca/local a la lista de `visitingLocals` del sitio. Retorna null si el sitio no existe. */
  addVisitingLocal(siteId: string, local: string): Promise<Site | null>;
}
