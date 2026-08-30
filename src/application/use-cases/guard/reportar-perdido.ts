import type { RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { Recorrido } from "@/domain/entities/recorrido";

export interface ReportarPerdidoDeps {
  recorridoRepository: RecorridoRepository;
}

export async function reportarPerdido(
  { recorridoRepository }: ReportarPerdidoDeps,
  motivo: string,
): Promise<Recorrido> {
  const reason = motivo.trim();
  if (!reason) throw new Error("Debe indicar el motivo por el que no pudo escanear.");
  return recorridoRepository.reportarPerdido(reason);
}
