import type { RecorridoRepository, ReportarPerdidoInput } from "@/domain/ports/recorrido-repository";
import type { Recorrido } from "@/domain/entities/recorrido";

export interface ReportarPerdidoDeps {
  recorridoRepository: RecorridoRepository;
}

export async function reportarPerdido(
  { recorridoRepository }: ReportarPerdidoDeps,
  input: ReportarPerdidoInput,
): Promise<Recorrido> {
  const motivo = input.motivo.trim();
  if (!motivo) throw new Error("Debe indicar el motivo por el que no pudo escanear.");
  return recorridoRepository.reportarPerdido({ ...input, motivo });
}
