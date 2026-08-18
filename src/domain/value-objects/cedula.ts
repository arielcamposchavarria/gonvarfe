export type Cedula = string & { readonly __brand: "Cedula" };

const CEDULA_PATTERN = /^\d{9}$/;

export function isValidCedula(value: string): boolean {
  return CEDULA_PATTERN.test(value.trim());
}

export function createCedula(value: string): Cedula {
  const normalized = value.trim();
  if (!isValidCedula(normalized)) {
    throw new Error(`Cédula inválida: debe tener 9 dígitos (recibido "${value}")`);
  }
  return normalized as Cedula;
}
