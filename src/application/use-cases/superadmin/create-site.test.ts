import { describe, expect, it } from "vitest";

import { createSite } from "./create-site";
import { createMockSiteRepository } from "@/infrastructure/mock/repositories/mock-site-repository";

describe("createSite", () => {
  it("crea un sitio activo, sin estaciones, con las marcas indicadas", async () => {
    const siteRepository = createMockSiteRepository();

    const site = await createSite(
      { siteRepository },
      { name: "Plaza Nueva", address: "San José", visitingLocals: ["Marca A", "Marca B"] },
    );

    expect(site.id).toBeTruthy();
    expect(site.name).toBe("Plaza Nueva");
    expect(site.isActive).toBe(true);
    expect(site.stations).toEqual([]);
    expect(site.visitingLocals).toEqual(["Marca A", "Marca B"]);
    await expect(siteRepository.findById(site.id)).resolves.toEqual(site);
  });
});
