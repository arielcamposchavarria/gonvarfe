import { requireAdmin } from "@/lib/auth/require-admin";
import { container } from "@/infrastructure/container";
import { slugifyFilename } from "@/lib/export/xlsx";
import { parseReportFormat, buildReportResponse } from "@/lib/export/report-response";
import { buildGuardEntryLogsSheet } from "@/lib/export/guard-report-sheets";
import { parseDateRangeParams } from "@/lib/date-range";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteContext<"/admin/guards/[guardId]/entry-logs/export">) {
  try {
    await requireAdmin();
  } catch {
    return new Response("No autorizado.", { status: 401 });
  }

  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) return new Response("Guard no encontrado.", { status: 404 });

  const range = parseDateRangeParams(new URL(request.url).searchParams);
  const entryLogs = await container.listGuardEntryLogs(guardId, range);

  return buildReportResponse(
    parseReportFormat(request),
    [buildGuardEntryLogsSheet(entryLogs)],
    `${slugifyFilename(detail.guard.name)}-bitacora-ingresos`,
  );
}
