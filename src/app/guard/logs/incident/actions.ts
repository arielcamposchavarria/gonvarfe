"use server";

import { redirect } from "next/navigation";

import { container } from "@/infrastructure/container";
import { requireGuard } from "@/lib/auth/require-guard";
import { incidentLogSchema } from "@/lib/validation/incident-log-schema";
import { MAX_LOG_IMAGES } from "@/domain/constants";
import { fileToDataUrl } from "@/lib/files/file-to-data-url";

export interface IncidentLogActionState {
  error: string | null;
}

export async function submitIncidentLogAction(
  _prevState: IncidentLogActionState,
  formData: FormData,
): Promise<IncidentLogActionState> {
  const guard = await requireGuard();

  const estado = await container.obtenerEstadoTurno();
  if (!estado.turno || !estado.sitio) {
    return { error: "No hay un turno activo. Inicie un turno primero." };
  }

  const parsed = incidentLogSchema.safeParse({
    incidentType: formData.get("incidentType"),
    incidentTypeDetail: formData.get("incidentTypeDetail") ?? undefined,
    locationZone: formData.get("locationZone"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const photos = formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (photos.length > MAX_LOG_IMAGES) {
    return { error: `Máximo ${MAX_LOG_IMAGES} imágenes.` };
  }

  const photoUrls = await Promise.all(photos.map(fileToDataUrl));

  await container.submitIncidentLog({
    sitioId: estado.sitio.id,
    guardId: guard.id,
    incidentType: parsed.data.incidentType,
    incidentTypeDetail: parsed.data.incidentType === "Otro" ? (parsed.data.incidentTypeDetail ?? null) : null,
    locationZone: parsed.data.locationZone,
    description: parsed.data.description,
    photoUrls,
  });

  redirect("/guard/dashboard");
}
