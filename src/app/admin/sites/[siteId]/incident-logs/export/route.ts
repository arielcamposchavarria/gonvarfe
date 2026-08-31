import { requireAdmin } from "@/lib/auth/require-admin";
import { container } from "@/infrastructure/container";
import { slugifyFilename } from "@/lib/export/xlsx";
import { parseReportFormat, buildReportResponse } from "@/lib/export/report-response";
import { buildSiteIncidentLogsSheet } from "@/lib/export/site-report-sheets";
import { parseDateRangeParams } from "@/lib/date-range";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteContext<"/admin/sites/[siteId]/incident-logs/export">) {
  try {
    await requireAdmin();
  } catch {
    return new Response("No autorizado.", { status: 401 });
  }

  const { siteId } = await params;
  const sitio = await container.getSitio(siteId);
  if (!sitio) return new Response("Sitio no encontrado.", { status: 404 });

  const range = parseDateRangeParams(new URL(request.url).searchParams);
  const incidentLogs = await container.listIncidentLogsBySite(siteId, range);

  return buildReportResponse(
    parseReportFormat(request),
    [buildSiteIncidentLogsSheet(incidentLogs)],
    `${slugifyFilename(sitio.nombre)}-bitacora-incidencias`,
  );
}
