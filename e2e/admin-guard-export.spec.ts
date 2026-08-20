import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/usuario/i).fill(username);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole("button", { name: /ingresar/i }).click();
}

test.describe("exportar reportes de guard a Excel", () => {
  test("el admin puede descargar el reporte completo y cada reporte individual", async ({ page }) => {
    await login(page, "admin", "1234");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.goto("/admin/guards/user-guard-1");
    await expect(page.getByRole("heading", { name: "Mario Solano" })).toBeVisible();

    const [fullDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /exportar todo/i }).click(),
    ]);
    expect(fullDownload.suggestedFilename()).toBe("mario-solano-reporte-completo.xlsx");

    await page.goto("/admin/guards/user-guard-1/missed-scans");
    const [missedDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /exportar a excel/i }).click(),
    ]);
    expect(missedDownload.suggestedFilename()).toBe("mario-solano-qr-no-escaneados.xlsx");

    await page.goto("/admin/guards/user-guard-1/scanned-stations");
    const [scannedDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /exportar a excel/i }).click(),
    ]);
    expect(scannedDownload.suggestedFilename()).toBe("mario-solano-qr-escaneados.xlsx");

    await page.goto("/admin/guards/user-guard-1/rounds");
    const [roundsDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /exportar a excel/i }).click(),
    ]);
    expect(roundsDownload.suggestedFilename()).toBe("mario-solano-recorridos.xlsx");
  });

  test("las rutas de exportación redirigen a login si no hay sesión de admin", async ({ page }) => {
    const response = await page.request.get("/admin/guards/user-guard-1/export", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain("/login");
  });
});
