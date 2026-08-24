import { test, expect } from "@playwright/test";

async function loginAsGuard(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/usuario/i).fill("guard");
  await page.getByLabel(/contraseña/i).fill("1234");
  await page.getByRole("button", { name: /ingresar/i }).click();
  await expect(page).toHaveURL(/\/guard\/dashboard$/);
}

test.describe("bitácoras del guard", () => {
  test("el guard completa la bitácora de ingreso", async ({ page }) => {
    await loginAsGuard(page);

    await page.getByTestId("option-entry-log").click();
    await expect(page).toHaveURL(/\/guard\/logs\/entry$/);

    await page.getByLabel(/placa/i).fill("ABC123");
    await page.getByLabel(/conductor/i).fill("Juan Pérez");
    await page.getByLabel(/cédula/i).fill("123456789");
    await page.getByLabel(/empresa/i).fill("Acme S.A.");
    await page.getByLabel(/motivo/i).fill("Entrega de mercadería");
    await page.getByLabel(/local que visita/i).selectOption("BANCO BAC SAN JOSE SA");

    await page.getByRole("button", { name: /guardar registro/i }).click();
    await expect(page).toHaveURL(/\/guard\/dashboard$/);
  });

  test("rechaza una cédula inválida en la bitácora de ingreso", async ({ page }) => {
    await loginAsGuard(page);

    await page.getByTestId("option-entry-log").click();
    await expect(page).toHaveURL(/\/guard\/logs\/entry$/);

    await page.getByLabel(/placa/i).fill("ABC123");
    await page.getByLabel(/conductor/i).fill("Juan Pérez");
    await page.getByLabel(/cédula/i).fill("123");
    await page.getByLabel(/empresa/i).fill("Acme S.A.");
    await page.getByLabel(/motivo/i).fill("Entrega");
    await page.getByLabel(/local que visita/i).selectOption("BANCO BAC SAN JOSE SA");

    await page.getByRole("button", { name: /guardar registro/i }).click();
    await expect(page.getByText(/cédula inválida/i)).toBeVisible();
    await expect(page).toHaveURL(/\/guard\/logs\/entry$/);
  });

  test("el guard reporta una incidencia", async ({ page }) => {
    await loginAsGuard(page);

    await page.getByTestId("option-incident-log").click();
    await expect(page).toHaveURL(/\/guard\/logs\/incident$/);

    await page.getByLabel(/tipo de incidencia/i).selectOption("Persona sospechosa");
    await page.getByLabel(/local o zona/i).fill("Entrada principal");
    await page.getByLabel(/descripción/i).fill("Persona merodeando por el parqueo.");

    await page.getByRole("button", { name: /guardar reporte/i }).click();
    await expect(page).toHaveURL(/\/guard\/dashboard$/);
  });
});
