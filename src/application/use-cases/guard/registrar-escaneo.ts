import type { EscanearInput, RecorridoRepository } from "@/domain/ports/recorrido-repository";
import type { Recorrido } from "@/domain/entities/recorrido";

export interface RegistrarEscaneoDeps {
  recorridoRepository: RecorridoRepository;
}

/**
 * El cliente nunca dice "qué marca" escanea, solo qué leyó la cámara (o que
 * saltó el escaneo en modo demo) — el servidor decide a cuál registro
 * corresponde (siempre el pendiente de menor `orden`) y valida QR/ventana.
 */
export async function registrarEscaneo(
  { recorridoRepository }: RegistrarEscaneoDeps,
  input: EscanearInput,
): Promise<Recorrido> {
  return recorridoRepository.escanear(input);
}
