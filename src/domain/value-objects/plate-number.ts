export type PlateNumber = string & { readonly __brand: "PlateNumber" };

const PLATE_PATTERN = /^[A-Z0-9-]{5,8}$/;

export function isValidPlateNumber(value: string): boolean {
  return PLATE_PATTERN.test(value.trim().toUpperCase());
}

export function createPlateNumber(value: string): PlateNumber {
  const normalized = value.trim().toUpperCase();
  if (!isValidPlateNumber(normalized)) {
    throw new Error(`Placa inválida (recibido "${value}")`);
  }
  return normalized as PlateNumber;
}
