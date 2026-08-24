import type { CreateSitioInput, SitioRepository } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";

/** Adaptador HTTP del puerto `SitioRepository` contra el backend real (gonvarbe). */
export function createHttpSitioRepository(): SitioRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  return {
    async findAll() {
      const res = await fetch(`${baseUrl}/sitios`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener los sitios.");
      return (await res.json()) as Sitio[];
    },

    async findById(id) {
      const res = await fetch(`${baseUrl}/sitios/${id}`, { cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo obtener el sitio.");
      return (await res.json()) as Sitio;
    },

    async create(input: CreateSitioInput) {
      const res = await fetch(`${baseUrl}/sitios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: input.nombre, direccion: input.direccion, marcas: input.marcas }),
      });
      if (!res.ok) throw new Error("No se pudo crear el sitio.");
      return (await res.json()) as Sitio;
    },

    async addMarca(sitioId, nombre) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/marcas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo agregar la marca.");
      return (await res.json()) as Sitio;
    },

    async generateMarcaQr(sitioId, marcaId) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/marcas/${marcaId}/qr`, { method: "POST" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo generar el QR de la marca.");
      return (await res.json()) as Sitio;
    },
  };
}
