import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { PwaRegister } from "./pwa-register";

describe("PwaRegister", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("registra el service worker en producción", () => {
    vi.stubEnv("NODE_ENV", "production");
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    render(<PwaRegister />);

    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("no registra el service worker fuera de producción", () => {
    vi.stubEnv("NODE_ENV", "test");
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    render(<PwaRegister />);

    expect(register).not.toHaveBeenCalled();
  });

  it("no falla si el navegador no soporta service workers", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("navigator", {});

    expect(() => render(<PwaRegister />)).not.toThrow();
  });
});
