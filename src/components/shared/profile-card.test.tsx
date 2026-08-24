import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProfileCard } from "./profile-card";
import type { GuardUser, AdminUser } from "@/domain/entities/user";

const GUARD: GuardUser = {
  id: "user-guard-1",
  name: "Mario Solano",
  username: "guard",
  role: "guard",
  assignedSiteId: "site-1",
  isActive: true,
  createdAt: new Date("2025-02-01"),
  photoUrl: null,
};

const ADMIN: AdminUser = {
  id: "user-admin-1",
  name: "Luis Herrera",
  username: "admin",
  role: "admin",
  isActive: true,
  createdAt: new Date("2025-01-15"),
};

describe("ProfileCard", () => {
  it("muestra un placeholder con iniciales cuando el guard no tiene foto asignada", () => {
    render(<ProfileCard user={GUARD} />);

    expect(screen.getByLabelText(/foto de perfil no asignada/i)).toHaveTextContent("MS");
    expect(screen.queryByAltText(/foto de perfil/i)).not.toBeInTheDocument();
  });

  it("muestra la foto de referencia cuando el guard tiene una asignada", () => {
    render(<ProfileCard user={{ ...GUARD, photoUrl: "https://example.com/guard.jpg" }} />);

    expect(screen.getByAltText(/foto de perfil/i)).toHaveAttribute("src", "https://example.com/guard.jpg");
  });

  it("no muestra foto ni placeholder para roles distintos de guard", () => {
    render(<ProfileCard user={ADMIN} />);

    expect(screen.queryByLabelText(/foto de perfil/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText(/foto de perfil/i)).not.toBeInTheDocument();
  });

  it("no incluye ningún control para cambiar la foto", () => {
    render(<ProfileCard user={GUARD} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/cambiar foto/i)).not.toBeInTheDocument();
  });
});
