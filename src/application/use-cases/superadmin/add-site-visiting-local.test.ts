import { describe, expect, it } from "vitest";

import { addSiteVisitingLocal, SiteNotFoundError } from "./add-site-visiting-local";
import { createSite } from "./create-site";
import { createMockSiteRepository } from "@/infrastructure/mock/repositories/mock-site-repository";

describe("addSiteVisitingLocal", () => {
  it("agrega la marca a la lista de locales del sitio", async () => {
    const siteRepository = createMockSiteRepository();
    const site = await createSite({ siteRepository }, { name: "Plaza Nueva", address: "San José", visitingLocals: ["Otro"] });

    const updated = await addSiteVisitingLocal({ siteRepository }, { siteId: site.id, local: "Marca Nueva" });

    expect(updated.visitingLocals).toEqual(["Otro", "Marca Nueva"]);
  });

  it("lanza SiteNotFoundError si el sitio no existe", async () => {
    const siteRepository = createMockSiteRepository();

    await expect(
      addSiteVisitingLocal({ siteRepository }, { siteId: "site-inexistente", local: "Marca" }),
    ).rejects.toBeInstanceOf(SiteNotFoundError);
  });
});
