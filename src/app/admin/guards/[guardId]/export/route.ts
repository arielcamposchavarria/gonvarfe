import { requireAdmin } from "@/lib/auth/require-admin";
import { container } from "@/infrastructure/container";
import { slugifyFilename } from "@/lib/export/xlsx";
import { parseReportFormat, buildReportResponse } from "@/lib/export/report-response";
import {
  buildGuardRoundsSheet,
  buildGuardScannedStationsSheet,
  buildGuardMissedScansSheet,
  buildGuardEntryLogsSheet,
  buildGuardIncidentLogsSheet,
} from "@/lib/export/guard-report-sheets";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteContext<"/admin/guards/[guardId]/export">) {
  try {
    await requireAdmin();
  } catch {
    return new Response("No autorizado.", { status: 401 });
  }

  const { guardId } = await params;
  const detail = await container.getGuardDetail(guardId);
  if (!detail) return new Response("Guard no encontrado.", { status: 404 });

  const [rounds, scannedStations, missedScans, entryLogs, incidentLogs] = await Promise.all([
    container.listGuardRounds(guardId),
    container.listGuardScannedStations(guardId),
    container.listGuardMissedScans(guardId),
    container.listGuardEntryLogs(guardId),
    container.listGuardIncidentLogs(guardId),
  ]);

  const sheets = [
    buildGuardRoundsSheet(rounds),
    buildGuardScannedStationsSheet(scannedStations),
    buildGuardMissedScansSheet(missedScans),
    buildGuardEntryLogsSheet(entryLogs),
    buildGuardIncidentLogsSheet(incidentLogs),
  ];

  return buildReportResponse(parseReportFormat(request), sheets, `${slugifyFilename(detail.guard.name)}-reporte-completo`);
}
