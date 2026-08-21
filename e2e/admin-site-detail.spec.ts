import { test, expect } from "@playwright/test";

/**
 * El estado de bitácoras vive en memoria (adaptador mock) y no se reinicia
 * entre corridas dentro del mismo proceso de servidor, por lo que al repetir
 * esta prueba localmente contra un `next dev` ya usado pueden acumularse
 * registros duplicados; por eso las aserciones usan `.first()`. En CI cada
 * ejecución levanta un servidor nuevo y parte limpio.
 */
async function login(page: import("@playwright/test").Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/usuario/i).fill(username);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole("button", { name: /ingresar/i }).click();
}

test.describe("detalle de sitio para admin", () => {
  test("el admin ve en la bitácora de un sitio los registros que llenó el guard, con su nombre", async ({
    page,
  }) => {
    await login(page, "guard", "1234");
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.getByTestId("option-entry-log").click();
    await page.getByLabel(/placa/i).fill("ZZZ999");
    await page.getByLabel(/conductor/i).fill("Sofía Detalle E2E");
    await page.getByLabel(/cédula/i).fill("123456789");
    await page.getByLabel(/empresa/i).fill("Acme S.A.");
    await page.getByLabel(/motivo/i).fill("Visita de prueba e2e");
    await page.getByLabel(/local que visita/i).selectOption("BAC");
    await page.getByRole("button", { name: /guardar registro/i }).click();
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.getByTestId("option-incident-log").click();
    await page.getByLabel(/tipo de incidencia/i).selectOption("Persona sospechosa");
    await page.getByLabel(/local o zona/i).fill("Zona de prueba e2e");
    await page.getByLabel(/descripción/i).fill("Incidencia generada por la prueba de detalle de sitio.");
    await page.getByRole("button", { name: /guardar reporte/i }).click();
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.getByRole("button", { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await login(page, "admin", "1234");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.getByText("Plaza Amara").click();
    await expect(page).toHaveURL(/\/admin\/sites\/site-1$/);
    await expect(page.getByRole("heading", { name: "Plaza Amara" })).toBeVisible();
    await expect(page.getByText(/estaciones configuradas/i)).toBeVisible();

    await page.getByText("Bitácora de ingresos").click();
    await expect(page).toHaveURL(/\/admin\/sites\/site-1\/entry-logs$/);
    await expect(page.getByText("Sofía Detalle E2E").first()).toBeVisible();
    await expect(page.getByText("Registrado por Mario Solano").first()).toBeVisible();

    await page.goBack();
    await page.getByText("Bitácora de incidencias").click();
    await expect(page).toHaveURL(/\/admin\/sites\/site-1\/incident-logs$/);
    await expect(page.getByText("Zona de prueba e2e").first()).toBeVisible();
    await expect(page.getByText(/mario solano/i).first()).toBeVisible();

    await page.goBack();
    await page.getByText("Recorridos").click();
    await expect(page).toHaveURL(/\/admin\/sites\/site-1\/rounds$/);
  });
});
