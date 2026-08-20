import { requireAdmin } from "@/lib/auth/require-admin";
import { container } from "@/infrastructure/container";
import { buildXlsxResponse, slugifyFilename } from "@/lib/export/xlsx";
import { buildGuardIncidentLogsSheet } from "@/lib/export/guard-report-sheets";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/admin/guards/[guardId]/incident-logs/export">,
) {
  try {
    await requireAdmin();
  } catch {
    return new Response("No autorizado.", { status: 401 });
  }

  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) return new Response("Guard no encontrado.", { status: 404 });

  const incidentLogs = await container.listGuardIncidentLogs(guardId);

  return buildXlsxResponse(
    [buildGuardIncidentLogsSheet(incidentLogs)],
    `${slugifyFilename(detail.guard.name)}-bitacora-incidencias.xlsx`,
  );
}
