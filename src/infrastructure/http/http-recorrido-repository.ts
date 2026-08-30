import type { EscanearInput, RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { Recorrido, RecorridoEstado } from "@/domain/entities/recorrido";
import type { RegistroEstado } from "@/domain/entities/registro";
import { getAccessToken } from "@/lib/auth/session";

interface BackendRegistro {
  id: string;
  marcaId: string;
  orden: number;
  estado: RegistroEstado;
  abreEn: string;
  cierraEn: string;
  escaneadoEn: string | null;
  motivoPerdido: string | null;
}

interface BackendRecorrido {
  id: string;
  turnoId: string;
  sitioId: string;
  secuencia: number;
  iniciadoEn: string;
  estado: RecorridoEstado;
  completadoEn: string | null;
  registros: BackendRegistro[];
  completado: boolean;
}

function mapRecorrido(dto: BackendRecorrido): Recorrido {
  return {
    id: dto.id,
    turnoId: dto.turnoId,
    sitioId: dto.sitioId,
    secuencia: dto.secuencia,
    iniciadoEn: new Date(dto.iniciadoEn),
    estado: dto.estado,
    completadoEn: dto.completadoEn ? new Date(dto.completadoEn) : null,
    registros: dto.registros.map((registro) => ({
      id: registro.id,
      marcaId: registro.marcaId,
      orden: registro.orden,
      estado: registro.estado,
      abreEn: new Date(registro.abreEn),
      cierraEn: new Date(registro.cierraEn),
      escaneadoEn: registro.escaneadoEn ? new Date(registro.escaneadoEn) : null,
      motivoPerdido: registro.motivoPerdido,
    })),
  };
}

/**
 * Traduce el 409 del backend (QR inválido / fuera de secuencia / ventana aún
 * no abre / recorrido ya completo / sitio sin marcas) a un mensaje en
 * español distinto por caso, usando `error` (nombre de la excepción de
 * dominio) — nunca el texto libre de `message` — para que la UI muestre el
 * mensaje correcto en cada caso.
 */
function mapConflictError(errorName: string | undefined): string {
  switch (errorName) {
    case "QrInvalidoException":
      return "El código QR no corresponde a la marca esperada. Respete el orden del recorrido.";
    case "VentanaAunNoAbreException":
      return "Todavía no se habilita la ventana de esta estación.";
    case "RecorridoYaCompletoException":
      return "Este recorrido ya está completo.";
    case "SitioSinMarcasException":
      return "El sitio no tiene marcas activas configuradas.";
    default:
      return "No se pudo procesar la solicitud.";
  }
}

/** Adaptador HTTP del puerto `RecorridoRepository` contra el backend real (gonvarbe). */
export function createHttpRecorridoRepository(): RecorridoRepository {
  const baseUrl = process.env.GONVARBE_API_URL ?? "http://localhost:3002";

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function throwConflict(res: Response): Promise<never> {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(mapConflictError(body?.error));
  }

  return {
    async escanear(input: EscanearInput) {
      const res = await fetch(`${baseUrl}/recorridos/escanear`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ qrValue: input.qrValue, skip: input.skip }),
      });
      if (res.status === 404) throw new Error("No hay un turno activo. Inicie un turno primero.");
      if (res.status === 409) return throwConflict(res);
      if (!res.ok) throw new Error("No se pudo registrar el escaneo.");
      return mapRecorrido((await res.json()) as BackendRecorrido);
    },

    async reportarPerdido(motivo: string) {
      const res = await fetch(`${baseUrl}/recorridos/reportar-perdido`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ motivo }),
      });
      if (res.status === 404) throw new Error("No hay un turno activo. Inicie un turno primero.");
      if (res.status === 409) return throwConflict(res);
      if (!res.ok) throw new Error("No se pudo reportar el escaneo perdido.");
      return mapRecorrido((await res.json()) as BackendRecorrido);
    },

    async activo() {
      const res = await fetch(`${baseUrl}/recorridos/activo`, { headers: await authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo obtener el recorrido activo.");
      // Nest envía body vacío (no el string "null") cuando el controller
      // retorna null — res.json() falla ahí, hay que leer como texto primero.
      const text = await res.text();
      return text ? mapRecorrido(JSON.parse(text) as BackendRecorrido) : null;
    },

    async porTurno(turnoId) {
      const res = await fetch(`${baseUrl}/recorridos/turno/${turnoId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudieron obtener los recorridos.");
      return ((await res.json()) as BackendRecorrido[]).map(mapRecorrido);
    },

    async porSitio(sitioId) {
      const res = await fetch(`${baseUrl}/recorridos/sitio/${sitioId}`, {
        headers: await authHeaders(),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudieron obtener los recorridos.");
      return ((await res.json()) as BackendRecorrido[]).map(mapRecorrido);
    },

    async porId(id) {
      const res = await fetch(`${baseUrl}/recorridos/${id}`, { headers: await authHeaders(), cache: "no-store" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo obtener el recorrido.");
      return mapRecorrido((await res.json()) as BackendRecorrido);
    },
  };
}
