/**
 * Convierte un File subido en un data URL para guardarlo en el repositorio
 * mock (en memoria). Solo válido mientras no exista almacenamiento real de
 * archivos (S3, blob storage, etc.).
 */
export async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
