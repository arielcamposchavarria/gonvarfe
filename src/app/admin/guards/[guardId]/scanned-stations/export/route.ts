import { requireAdmin } from "@/lib/auth/require-admin";
import { container } from "@/infrastructure/container";
import { slugifyFilename } from "@/lib/export/xlsx";
import { parseReportFormat, buildReportResponse } from "@/lib/export/report-response";
import { buildGuardScannedStationsSheet } from "@/lib/export/guard-report-sheets";
import { parseDateRangeParams } from "@/lib/date-range";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: RouteContext<"/admin/guards/[guardId]/scanned-stations/export">,
) {
  try {
    await requireAdmin();
  } catch {
    return new Response("No autorizado.", { status: 401 });
  }

  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) return new Response("Guard no encontrado.", { status: 404 });

  const range = parseDateRangeParams(new URL(request.url).searchParams);
  const scannedStations = await container.listGuardScannedStations(guardId, range);

  return buildReportResponse(
    parseReportFormat(request),
    [buildGuardScannedStationsSheet(scannedStations)],
    `${slugifyFilename(detail.guard.name)}-qr-escaneados`,
  );
}
