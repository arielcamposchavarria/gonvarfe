/**
 * Convierte un File subido en un data URL para guardarlo tal cual en la
 * base de datos (columna `longtext`, ver los `*.orm-entity.ts` de fotos en
 * gonvarbe) — decisión deliberada de no depender de una cuenta/servicio de
 * almacenamiento externo (S3, Cloudinary, etc.). El límite de tamaño del
 * body que antes rechazaba estas subidas se subió en
 * `next.config.ts` (`experimental.serverActions.bodySizeLimit`) y en
 * `gonvarbe/src/main.ts` (bodyParser de Nest/Express) — ver comentarios ahí.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
