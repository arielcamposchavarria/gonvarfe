import type { Site } from "../entities/site";

export interface SiteRepository {
  findAll(): Promise<Site[]>;
  findById(id: string): Promise<Site | null>;
}
