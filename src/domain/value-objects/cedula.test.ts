import { describe, expect, it } from "vitest";
import { createCedula, isValidCedula } from "./cedula";

describe("cedula", () => {
  it("acepta una cédula de 9 dígitos", () => {
    expect(isValidCedula("123456789")).toBe(true);
    expect(createCedula("123456789")).toBe("123456789");
  });

  it("rechaza cédulas con una cantidad de dígitos distinta a 9", () => {
    expect(isValidCedula("12345")).toBe(false);
    expect(isValidCedula("1234567890")).toBe(false);
  });

  it("rechaza cédulas con caracteres no numéricos", () => {
    expect(isValidCedula("12345678a")).toBe(false);
  });

  it("lanza un error al crear una cédula inválida", () => {
    expect(() => createCedula("abc")).toThrow(/Cédula inválida/);
  });
});
