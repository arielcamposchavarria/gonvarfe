import type { CreateSitioInput, SitioRepository, UpdateSitioInput } from "@/domain/ports/sitio-repository";
import type { Sitio } from "@/domain/entities/sitio";
import { getAccessToken } from "@/lib/auth/session";

/** Adaptador HTTP del puerto `SitioRepository` contra el backend real (gonvarbe). */
export function createHttpSitioRepository(): SitioRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async findAll() {
      const res = await fetch(`${baseUrl}/sitios`, { headers: await authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron obtener los sitios.");
      return (await res.json()) as Sitio[];
    },

    async findById(id) {
      const res = await fetch(`${baseUrl}/sitios/${id}`, { headers: await authHeaders(), cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo obtener el sitio.");
      return (await res.json()) as Sitio;
    },

    async create(input: CreateSitioInput) {
      const res = await fetch(`${baseUrl}/sitios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ nombre: input.nombre, direccion: input.direccion, marcas: input.marcas }),
      });
      if (!res.ok) throw new Error("No se pudo crear el sitio.");
      return (await res.json()) as Sitio;
    },

    async update(sitioId, input: UpdateSitioInput) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ nombre: input.nombre, direccion: input.direccion }),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo editar el sitio.");
      return (await res.json()) as Sitio;
    },

    async deactivate(sitioId) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/deactivate`, {
        method: "PATCH",
        headers: await authHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo desactivar el sitio.");
      return (await res.json()) as Sitio;
    },

    async addMarca(sitioId, nombre) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/marcas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ nombre }),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo agregar la marca.");
      return (await res.json()) as Sitio;
    },

    async generateMarcaQr(sitioId, marcaId) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/marcas/${marcaId}/qr`, {
        method: "POST",
        headers: await authHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo generar el QR de la marca.");
      return (await res.json()) as Sitio;
    },

    async updateMarca(sitioId, marcaId, nombre) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/marcas/${marcaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ nombre }),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo editar la marca.");
      return (await res.json()) as Sitio;
    },

    async deactivateMarca(sitioId, marcaId) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/marcas/${marcaId}/deactivate`, {
        method: "PATCH",
        headers: await authHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo desactivar la marca.");
      return (await res.json()) as Sitio;
    },

    async createLocal(sitioId, nombre) {
      const res = await fetch(`${baseUrl}/sitios/${sitioId}/locales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ nombre }),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo crear el local.");
      return (await res.json()) as Sitio;
    },
  };
}
