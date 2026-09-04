"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface ForzarFinalizarTurnoActionState {
  error: string | null;
}

/**
 * El admin fuerza el cierre del turno de un guardia desde el listado de
 * recorridos del sitio (p. ej. si el guardia no pudo finalizarlo él mismo):
 * a diferencia de lo que hace el propio guard, esto nunca se bloquea por
 * marcas sin escanear en un recorrido en curso.
 */
export async function forzarFinalizarTurnoAction(
  siteId: string,
  turnoId: string,
): Promise<ForzarFinalizarTurnoActionState> {
  await requireAdmin();

  try {
    await container.forzarFinalizarTurno(turnoId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }

  revalidatePath(`/admin/sites/${siteId}/rounds`);
  return { error: null };
}
