"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireGuard } from "@/app/guard/actions";
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

  const parsed = entryLogSchema.safeParse({
    date: formData.get("date"),
    entryTime: formData.get("entryTime"),
    exitTime: formData.get("exitTime"),
    plate: formData.get("plate"),
    driverName: formData.get("driverName"),
    cedula: formData.get("cedula"),
    company: formData.get("company"),
    reason: formData.get("reason"),
    visitingLocal: formData.get("visitingLocal"),
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
    siteId: guard.assignedSiteId,
    guardId: guard.id,
    date: parsed.data.date,
    entryTime: parsed.data.entryTime,
    exitTime: parsed.data.exitTime,
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
