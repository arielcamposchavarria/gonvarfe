"use server";

import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireGuard } from "@/lib/auth/require-guard";

export interface GuardActionState {
  error: string | null;
}

const OK: GuardActionState = { error: null };

function toErrorState(error: unknown): GuardActionState {
  return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
}

export async function startShiftAction(): Promise<GuardActionState> {
  const guard = await requireGuard();
  try {
    await container.startShift(guard);
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  return OK;
}

export async function scanStationAction(stationId: string): Promise<GuardActionState> {
  const guard = await requireGuard();
  try {
    await container.scanStation({ guardId: guard.id, stationId });
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  return OK;
}

export async function endShiftAction(): Promise<GuardActionState> {
  const guard = await requireGuard();
  try {
    await container.endShift(guard.id);
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  return OK;
}

export async function reportMissedScanAction(stationId: string, reason: string): Promise<GuardActionState> {
  const guard = await requireGuard();
  try {
    await container.reportMissedScan({ guardId: guard.id, stationId, reason });
  } catch (error) {
    return toErrorState(error);
  }
  revalidatePath("/guard/dashboard");
  return OK;
}
