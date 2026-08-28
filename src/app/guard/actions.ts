"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireGuard } from "@/lib/auth/require-guard";
import type { EscanearInput } from "@/domain/ports/recorrido-repository";

export interface GuardActionState {
  error: string | null;
}

const OK: GuardActionState = { error: null };

function toErrorState(error: unknown): GuardActionState {
  return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
}

export async function iniciarTurnoAction(sitioId: string): Promise<GuardActionState> {
  await requireGuard();
  try {
    await container.iniciarTurno(sitioId);
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  return OK;
}

export async function registrarEscaneoAction(input: EscanearInput): Promise<GuardActionState> {
  await requireGuard();
  try {
    await container.registrarEscaneo(input);
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  revalidatePath("/guard/scan");
  return OK;
}

export async function reportarPerdidoAction(motivo: string): Promise<GuardActionState> {
  await requireGuard();
  try {
    await container.reportarPerdido(motivo);
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  revalidatePath("/guard/scan");
  return OK;
}

export async function finalizarTurnoAction(): Promise<GuardActionState> {
  await requireGuard();
  try {
    await container.finalizarTurno();
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  return OK;
}
