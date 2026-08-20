import { test, expect } from "@playwright/test";

/**
 * El estado de jornadas y bitácoras vive en memoria (adaptador mock) y no se
 * reinicia entre corridas dentro del mismo proceso de servidor, por lo que al
 * repetir esta prueba localmente contra un `next dev` ya usado pueden
 * acumularse registros duplicados; por eso las aserciones usan `.first()`. En
 * CI cada ejecución levanta un servidor nuevo y parte limpio.
 */
async function login(page: import("@playwright/test").Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/usuario/i).fill(username);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole("button", { name: /ingresar/i }).click();
}

test.describe("detalle de guard para admin", () => {
  test("el admin ve el estado, los totales y las bitácoras de un guard", async ({ page }) => {
    await login(page, "guard", "1234");
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.getByTestId("option-entry-log").click();
    await page.getByLabel(/placa/i).fill("YYY888");
    await page.getByLabel(/conductor/i).fill("Carlos Detalle Guard E2E");
    await page.getByLabel(/cédula/i).fill("123456789");
    await page.getByLabel(/empresa/i).fill("Acme S.A.");
    await page.getByLabel(/motivo/i).fill("Visita de prueba e2e");
    await page.getByLabel(/local que visita/i).selectOption("BAC");
    await page.getByRole("button", { name: /guardar registro/i }).click();
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.getByTestId("option-incident-log").click();
    await page.getByLabel(/tipo de incidencia/i).selectOption("Persona sospechosa");
    await page.getByLabel(/local o zona/i).fill("Zona detalle guard e2e");
    await page.getByLabel(/descripción/i).fill("Incidencia generada por la prueba de detalle de guard.");
    await page.getByRole("button", { name: /guardar reporte/i }).click();
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.getByRole("button", { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await login(page, "admin", "1234");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.goto("/admin/guards");
    await page.locator("table").getByText("Mario Solano").click();
    await expect(page).toHaveURL(/\/admin\/guards\/user-guard-1$/);
    await expect(page.getByRole("heading", { name: "Mario Solano" })).toBeVisible();

    // El estado (en jornada activa o "No ha iniciado turno") depende de si otras pruebas
    // dejaron una jornada activa para este guard en el mismo servidor; solo se valida que
    // la tarjeta de estado se muestre.
    await expect(page.getByText(/actualmente en|no ha iniciado turno/i)).toBeVisible();

    await page.getByText("Bitácora de ingresos").click();
    await expect(page).toHaveURL(/\/admin\/guards\/user-guard-1\/entry-logs$/);
    await expect(page.getByText("Carlos Detalle Guard E2E").first()).toBeVisible();
    await expect(page.getByText("Sitio: Plaza Amara").first()).toBeVisible();

    await page.goBack();
    await page.getByText("Bitácora de incidencias").click();
    await expect(page).toHaveURL(/\/admin\/guards\/user-guard-1\/incident-logs$/);
    await expect(page.getByText("Zona detalle guard e2e").first()).toBeVisible();
    await expect(page.getByText(/plaza amara/i).first()).toBeVisible();

    await page.goBack();
    await page.getByText("QR no escaneados").click();
    await expect(page).toHaveURL(/\/admin\/guards\/user-guard-1\/missed-scans$/);
  });
});
