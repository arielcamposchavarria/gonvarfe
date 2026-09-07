import { describe, expect, it } from "vitest";

import { buildAppUser, type BackendUser } from "./map-backend-user";

describe("buildAppUser", () => {
  it("mapea email y fotoPerfil (a photoUrl) para un admin", () => {
    const backendUser: BackendUser = {
      id: "user-1",
      username: "jperez",
      name: "Juan Pérez",
      role: "admin",
      isActive: true,
      email: "jperez@example.com",
      fotoPerfil: "data:image/png;base64,foto1",
    };

    const user = buildAppUser(backendUser);

    expect(user).toMatchObject({
      email: "jperez@example.com",
      photoUrl: "data:image/png;base64,foto1",
    });
  });

  it("mapea email y fotoPerfil para un guard, junto con assignedSiteId", () => {
    const backendUser: BackendUser = {
      id: "guard-1",
      username: "msolano",
      name: "Mario Solano",
      role: "guard",
      isActive: true,
      email: "msolano@example.com",
      fotoPerfil: "data:image/png;base64,foto2",
      sitioAsignadoId: "sitio-1",
    };

    const user = buildAppUser(backendUser);

    expect(user).toMatchObject({
      role: "guard",
      email: "msolano@example.com",
      photoUrl: "data:image/png;base64,foto2",
      assignedSiteId: "sitio-1",
    });
  });

  it("mapea email y fotoPerfil para un superAdmin", () => {
    const backendUser: BackendUser = {
      id: "sa-1",
      username: "root",
      name: "Root",
      role: "superAdmin",
      isActive: true,
      email: "root@example.com",
      fotoPerfil: null,
    };

    const user = buildAppUser(backendUser);

    expect(user).toMatchObject({ role: "superAdmin", email: "root@example.com", photoUrl: null });
  });

  it("si el backend no envía email/fotoPerfil, quedan en null (no undefined)", () => {
    const backendUser: BackendUser = {
      id: "user-1",
      username: "jperez",
      name: "Juan Pérez",
      role: "admin",
      isActive: true,
    };

    const user = buildAppUser(backendUser);

    expect(user.email).toBeNull();
    expect(user.photoUrl).toBeNull();
  });

  it("lanza un error si el rol es desconocido", () => {
    const backendUser = {
      id: "user-1",
      username: "jperez",
      name: "Juan Pérez",
      role: "rol-inventado",
      isActive: true,
    } as unknown as BackendUser;

    expect(() => buildAppUser(backendUser)).toThrow(/rol desconocido/i);
  });
});
