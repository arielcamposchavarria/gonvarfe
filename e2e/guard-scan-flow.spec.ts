import { test, expect } from "@playwright/test";

/**
 * El estado de jornadas/recorridos vive en memoria (adaptador mock) y no se
 * reinicia entre corridas dentro del mismo proceso de servidor. En CI cada
 * ejecución levanta un servidor nuevo, así que el estado siempre parte limpio;
 * al correr localmente contra un `next dev` ya usado, este test puede
 * necesitar un reinicio del servidor para volver a pasar.
 */
test("un guard inicia su jornada, la estación 1 queda escaneada automáticamente y no puede escanear la estación 2 antes de tiempo", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel(/usuario/i).fill("guard");
  await page.getByLabel(/contraseña/i).fill("1234");
  await page.getByRole("button", { name: /ingresar/i }).click();
  await expect(page).toHaveURL(/\/guard\/dashboard$/);

  await page.getByRole("button", { name: /escanear qr de inicio/i }).click();

  const station1 = page.getByTestId("station-scan-1");
  await expect(station1.getByText("Escaneada")).toBeVisible();

  const station2 = page.getByTestId("station-scan-2");
  await expect(station2.getByRole("button", { name: /^escanear$/i })).toBeDisabled();

  await station2.getByRole("button", { name: /no pude escanear/i }).click();
  await page.getByLabel(/motivo/i).fill("QR dañado, no se puede leer.");
  await page.getByRole("button", { name: /^reportar$/i }).click();

  await expect(station2.getByText("No escaneada")).toBeVisible();
});
