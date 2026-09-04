import type { TurnoRepository } from "@/domain/ports/turno-repository";
import type { Turno, TurnoEstado } from "@/domain/entities/turno";
import { getAccessToken } from "@/lib/auth/session";

interface BackendTurno {
  id: string;
  guardiaId: string;
  sitioId: string;
  iniciadoEn: string;
  estado: TurnoEstado;
  finalizadoEn: string | null;
}

function mapTurno(dto: BackendTurno): Turno {
  return {
    id: dto.id,
    guardiaId: dto.guardiaId,
    sitioId: dto.sitioId,
    iniciadoEn: new Date(dto.iniciadoEn),
    estado: dto.estado,
    finalizadoEn: dto.finalizadoEn ? new Date(dto.finalizadoEn) : null,
  };
}

/** Adaptador HTTP del puerto `TurnoRepository` contra el backend real (gonvarbe). */
export function createHttpTurnoRepository(): TurnoRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  return {
    async activo() {
      const res = await fetch(`${baseUrl}/turnos/activo`, { headers: await authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo obtener el turno activo.");
      // Nest envía body vacío (no el string "null") cuando el controller
      // retorna null — res.json() falla ahí, hay que leer como texto primero.
      const text = await res.text();
      return text ? mapTurno(JSON.parse(text) as BackendTurno) : null;
    },

    async iniciar(sitioId) {
      const res = await fetch(`${baseUrl}/turnos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ sitioId }),
      });
      if (res.status === 409) throw new Error("Ya tiene un turno activo, o el sitio no está disponible.");
      if (!res.ok) throw new Error("No se pudo iniciar el turno.");
      return mapTurno((await res.json()) as BackendTurno);
    },

    async finalizar(turnoId) {
      const res = await fetch(`${baseUrl}/turnos/${turnoId}/finalizar`, {
        method: "PATCH",
        headers: await authHeaders(),
      });
      if (res.status === 409) throw new Error("No puede finalizar el turno mientras haya un recorrido en curso.");
      if (!res.ok) throw new Error("No se pudo finalizar el turno.");
      return mapTurno((await res.json()) as BackendTurno);
    },

    async forzarFinalizar(turnoId) {
      const res = await fetch(`${baseUrl}/turnos/${turnoId}/forzar-finalizar`, {
        method: "PATCH",
        headers: await authHeaders(),
      });
      if (res.status === 409) throw new Error("Este turno ya está finalizado.");
      if (res.status === 404) throw new Error("No se encontró el turno.");
      if (!res.ok) throw new Error("No se pudo finalizar el turno.");
      return mapTurno((await res.json()) as BackendTurno);
    },

    async porGuardia(guardiaId) {
      const res = await fetch(`${baseUrl}/turnos/guardia/${guardiaId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudieron obtener los turnos.");
      return ((await res.json()) as BackendTurno[]).map(mapTurno);
    },

    async porSitio(sitioId) {
      const res = await fetch(`${baseUrl}/turnos/sitio/${sitioId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudieron obtener los turnos.");
      return ((await res.json()) as BackendTurno[]).map(mapTurno);
    },
  };
}
