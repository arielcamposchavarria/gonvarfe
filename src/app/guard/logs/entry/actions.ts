"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { container } from "@/infrastructure/container";
import { requireGuard } from "@/lib/auth/require-guard";
import { entryLogSchema } from "@/lib/validation/entry-log-schema";
import { createCedula } from "@/domain/value-objects/cedula";
import { createPlateNumber } from "@/domain/value-objects/plate-number";
import { MAX_LOG_IMAGES } from "@/domain/constants";
import { fileToDataUrl } from "@/lib/files/file-to-data-url";

export interface EntryLogActionState {
  error: string | null;
}

export async function submitEntryLogAction(
  _prevState: EntryLogActionState,
  formData: FormData,
): Promise<EntryLogActionState> {
  const guard = await requireGuard();

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno || !estado.sitio) {
    return { error: "No hay un turno activo. Inicie un turno primero." };
  }

  const selectedLocal = formData.get("visitingLocal");
  const visitingLocal =
    selectedLocal === "Otro" ? formData.get("visitingLocalOther") : selectedLocal;

  const parsed = entryLogSchema.safeParse({
    date: formData.get("date"),
    plate: formData.get("plate"),
    driverName: formData.get("driverName"),
    cedula: formData.get("cedula"),
    company: formData.get("company"),
    reason: formData.get("reason"),
    visitingLocal,
    observations: formData.get("observations"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const photos = formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (photos.length > MAX_LOG_IMAGES) {
    return { error: `Máximo ${MAX_LOG_IMAGES} imágenes.` };
  }

  const photoUrls = await Promise.all(photos.map(fileToDataUrl));

  await container.submitEntryLog({
    sitioId: estado.sitio.id,
    guardId: guard.id,
    date: parsed.data.date,
    plate: createPlateNumber(parsed.data.plate),
    driverName: parsed.data.driverName,
    cedula: createCedula(parsed.data.cedula),
    company: parsed.data.company,
    reason: parsed.data.reason,
    visitingLocal: parsed.data.visitingLocal,
    observations: parsed.data.observations ?? "",
    photoUrls,
  });

  redirect("/guard/dashboard");
}

export interface RegistrarSalidaActionState {
  error: string | null;
}

export async function registrarSalidaAction(logId: string): Promise<RegistrarSalidaActionState> {
  await requireGuard();
  try {
    await container.registrarSalidaEntryLog(logId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Ocurrió un error inesperado." };
  }
  revalidatePath("/guard/logs/entry");
  return { error: null };
}
