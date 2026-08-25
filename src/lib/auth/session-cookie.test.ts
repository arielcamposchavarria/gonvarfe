// @vitest-environment node
// jose usa comprobaciones de tipo de clave que fallan bajo jsdom (Uint8Array
// de un realm distinto); esta prueba corre en el entorno node real.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";

import { parseSessionCookie } from "./session-cookie";

const TEST_SECRET = "test-secret-usado-solo-en-esta-prueba";

function getSecretKey() {
  return new TextEncoder().encode(TEST_SECRET);
}

async function signToken(claims: Record<string, unknown>, expiresIn = "1h") {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

describe("parseSessionCookie", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("retorna null si no hay cookie", async () => {
    await expect(parseSessionCookie(undefined)).resolves.toBeNull();
    await expect(parseSessionCookie(null)).resolves.toBeNull();
  });

  it("retorna null si el token está mal formado", async () => {
    await expect(parseSessionCookie("no-es-un-jwt")).resolves.toBeNull();
  });

  it("retorna null si la firma no coincide con JWT_SECRET", async () => {
    const wrongKey = new TextEncoder().encode("otro-secreto-distinto");
    const token = await new SignJWT({ sub: "user-1", username: "admin", name: "Admin", role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(wrongKey);

    await expect(parseSessionCookie(token)).resolves.toBeNull();
  });

  it("retorna null si el token ya expiró", async () => {
    const token = await signToken(
      { sub: "user-1", username: "admin", name: "Admin", role: "admin" },
      "-1s",
    );

    await expect(parseSessionCookie(token)).resolves.toBeNull();
  });

  it("retorna null si el rol del payload no es válido", async () => {
    const token = await signToken({ sub: "user-1", username: "admin", name: "Admin", role: "root" });

    await expect(parseSessionCookie(token)).resolves.toBeNull();
  });

  it("retorna el payload de sesión si el token es válido", async () => {
    const token = await signToken({ sub: "user-1", username: "gvargas", name: "Gabriela Vargas", role: "superAdmin" });

    await expect(parseSessionCookie(token)).resolves.toEqual({
      userId: "user-1",
      username: "gvargas",
      name: "Gabriela Vargas",
      role: "superAdmin",
    });
  });
});
