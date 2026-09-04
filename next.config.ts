import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // pdfkit carga sus fuentes AFM vía fs relativo a su propio módulo; si
  // Turbopack lo empaqueta, esa ruta se rompe y la exportación a PDF falla
  // en runtime con un 500 (no se ve en build ni en tests unitarios).
  serverExternalPackages: ["pdfkit"],
  experimental: {
    serverActions: {
      // Las fotos de bitácoras/reportes viajan como File en el FormData de
      // la server action antes de convertirse a base64 (ver
      // src/lib/files/file-to-data-url.ts). El límite por defecto (1mb)
      // rechazaba la subida con varias fotos de cámara sin ningún mensaje
      // claro para el guard — subirlo aquí es lo que de verdad falta,
      // aparte del límite del backend (ver gonvarbe/src/main.ts).
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
