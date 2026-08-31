/**
 * Rasteriza un <svg> (ej. de QRCodeSVG) a un PNG en memoria. Se usa para
 * ofrecer "descargar" sobre un QR que hoy solo se muestra en pantalla.
 */
export function svgToPngDataUrl(svg: SVGSVGElement, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const serialized = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo generar la imagen del QR."));
    };
    image.src = url;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

/** Nombre de archivo seguro a partir del nombre de una marca. */
export function qrFileName(marcaNombre: string): string {
  const slug = marcaNombre
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `qr-${slug || "marca"}.png`;
}
