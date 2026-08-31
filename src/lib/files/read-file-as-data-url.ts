/**
 * Convierte un File a data URL del lado del cliente (FileReader), para
 * componentes que no pasan por un `<form action>` de servidor (donde se usa
 * `fileToDataUrl` en su lugar).
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}
