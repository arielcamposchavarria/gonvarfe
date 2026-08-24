import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // pdfkit carga sus fuentes AFM vía fs relativo a su propio módulo; si
  // Turbopack lo empaqueta, esa ruta se rompe y la exportación a PDF falla
  // en runtime con un 500 (no se ve en build ni en tests unitarios).
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
