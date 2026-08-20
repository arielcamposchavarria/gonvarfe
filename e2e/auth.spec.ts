import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/usuario/i).fill(username);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole("button", { name: /ingresar/i }).click();
}

test.describe("login y control de acceso por rol", () => {
  test("un superAdmin inicia sesión y ve su panel de usuarios", async ({ page }) => {
    await login(page, "superAdmin", "1234");

    await expect(page).toHaveURL(/\/superadmin\/dashboard$/);
    await expect(page.getByRole("heading", { name: /usuarios del sistema/i })).toBeVisible();
  });

  test("un admin inicia sesión y ve sus sitios", async ({ page }) => {
    await login(page, "admin", "1234");

    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.getByRole("heading", { name: /^sitios$/i })).toBeVisible();
  });

  test("un guard inicia sesión y ve su panel de recorridos", async ({ page }) => {
    await login(page, "guard", "1234");

    await expect(page).toHaveURL(/\/guard\/dashboard$/);
    await expect(page.getByText(/plaza amara/i)).toBeVisible();
  });

  test("credenciales inválidas muestran un error y no inician sesión", async ({ page }) => {
    await login(page, "guard", "incorrecta");

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("un guard desactivado no puede iniciar sesión", async ({ page }) => {
    await login(page, "guardInactivo", "1234");

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("un usuario sin sesión que visita una ruta de admin es redirigido a login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("un guard autenticado no puede acceder a rutas de admin ni de superAdmin", async ({ page }) => {
    await login(page, "guard", "1234");
    await expect(page).toHaveURL(/\/guard\/dashboard$/);

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/superadmin/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
