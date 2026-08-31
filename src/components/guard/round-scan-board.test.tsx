import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { RoundScanBoard } from "./round-scan-board";
import type { GuardSitio } from "@/domain/entities/guard-sitio";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Registro } from "@/domain/entities/registro";

const { registrarEscaneoActionMock, reportarPerdidoActionMock, finalizarTurnoActionMock, pushMock } = vi.hoisted(
  () => ({
    registrarEscaneoActionMock: vi.fn(),
    reportarPerdidoActionMock: vi.fn(),
    finalizarTurnoActionMock: vi.fn(),
    pushMock: vi.fn(),
  }),
);

vi.mock("@/app/guard/actions", () => ({
  registrarEscaneoAction: registrarEscaneoActionMock,
  reportarPerdidoAction: reportarPerdidoActionMock,
  finalizarTurnoAction: finalizarTurnoActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("./qr-scan-camera", () => ({
  QrScanCamera: ({ onDecode }: { onDecode: (value: string) => void }) => (
    <button onClick={() => onDecode("qr-marca-1")}>simular-decodificacion</button>
  ),
}));

const NOW = Date.now();

const SITIO: GuardSitio = {
  id: "sitio-1",
  nombre: "Plaza Amara",
  direccion: "San José",
  marcas: [
    { id: "marca-1", nombre: "Entrada principal", orden: 1, activo: true },
    { id: "marca-2", nombre: "Área de carga", orden: 2, activo: true },
  ],
  locales: [],
};

function buildRegistro(overrides: Partial<Registro>): Registro {
  return {
    id: "registro-1",
    marcaId: "marca-1",
    orden: 1,
    estado: "pendiente",
    abreEn: new Date(NOW - 60_000),
    cierraEn: new Date(NOW + 60_000),
    escaneadoEn: null,
    motivoPerdido: null,
    ...overrides,
  };
}

function buildRecorrido(registros: Registro[]): Recorrido {
  return {
    id: "recorrido-1",
    turnoId: "turno-1",
    sitioId: SITIO.id,
    secuencia: 1,
    iniciadoEn: new Date(NOW),
    estado: "en-progreso",
    completadoEn: null,
    registros,
  };
}

/**
 * `useNow` empieza en 0 hasta el primer tick de su intervalo (1s, SSR-safe).
 * Se usan timers falsos solo durante el render + avance inicial (de forma
 * síncrona, sin ningún `await` de por medio) y se vuelve a timers reales
 * antes de cualquier interacción de `userEvent`, para no bloquear su propio
 * manejo interno de tiempos.
 */
function renderTicked(ui: ReactElement) {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  const result = render(ui);
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  vi.useRealTimers();
  return result;
}

describe("RoundScanBoard", () => {
  beforeEach(() => {
    registrarEscaneoActionMock.mockReset().mockResolvedValue({ error: null });
    reportarPerdidoActionMock.mockReset().mockResolvedValue({ error: null });
    finalizarTurnoActionMock.mockReset().mockResolvedValue({ error: null });
    pushMock.mockReset();
  });

  it("sin recorrido activo, ofrece iniciar el recorrido escaneando o saltando (camino de saltar)", async () => {
    const user = userEvent.setup();
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={null} recorridosCompletados={0} />);

    expect(screen.getByText(/iniciar recorrido/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /omitir escaneo \(demo\)/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    expect(registrarEscaneoActionMock).toHaveBeenCalledWith({ skip: true });
  });

  it("deshabilita 'Escanear' mientras la ventana de la marca objetivo no ha abierto", () => {
    const recorrido = buildRecorrido([
      buildRegistro({ abreEn: new Date(NOW + 60_000), cierraEn: new Date(NOW + 120_000) }),
    ]);
    renderTicked(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);

    expect(screen.getByRole("button", { name: /^escanear$/i })).toBeDisabled();
  });

  it("habilita 'Escanear' una vez abierta la ventana, y abre la cámara al presionarlo (camino de cámara)", async () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    renderTicked(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);
    const user = userEvent.setup();

    const scanButton = screen.getByRole("button", { name: /^escanear$/i });
    expect(scanButton).toBeEnabled();

    await user.click(scanButton);
    await user.click(screen.getByRole("button", { name: /simular-decodificacion/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    expect(registrarEscaneoActionMock).toHaveBeenCalledWith({ qrValue: "qr-marca-1", skip: false });
  });

  it("permite adjuntar una observación antes de confirmar el escaneo, y la envía a la acción", async () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    renderTicked(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /^escanear$/i }));
    await user.click(screen.getByRole("button", { name: /simular-decodificacion/i }));

    await user.type(await screen.findByLabelText(/observación/i), "Se ve normal, sin novedad");
    await user.click(screen.getByRole("button", { name: /^confirmar$/i }));

    expect(registrarEscaneoActionMock).toHaveBeenCalledWith(
      expect.objectContaining({ qrValue: "qr-marca-1", observacion: "Se ve normal, sin novedad" }),
    );
  });

  it("al cancelar el diálogo de confirmación, no llama la acción", async () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    renderTicked(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /^escanear$/i }));
    await user.click(screen.getByRole("button", { name: /simular-decodificacion/i }));
    await user.click(await screen.findByRole("button", { name: /cancelar/i }));

    expect(registrarEscaneoActionMock).not.toHaveBeenCalled();
  });

  it("respeta el orden: solo la marca pendiente de menor orden muestra botones de acción", () => {
    const recorrido = buildRecorrido([
      buildRegistro({ id: "r1", marcaId: "marca-1", orden: 1, estado: "a-tiempo", escaneadoEn: new Date(NOW) }),
      buildRegistro({ id: "r2", marcaId: "marca-2", orden: 2, estado: "pendiente" }),
    ]);
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);

    expect(screen.getAllByRole("button", { name: /^escanear$/i })).toHaveLength(1);
    expect(screen.getByText("Área de carga")).toBeInTheDocument();
  });

  it("muestra el error de secuencia inválida / QR incorrecto devuelto por la acción", async () => {
    registrarEscaneoActionMock.mockResolvedValue({
      error: "El código QR no corresponde a la marca esperada. Respete el orden del recorrido.",
    });
    const user = userEvent.setup();
    const recorrido = buildRecorrido([buildRegistro({})]);
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);

    await user.click(screen.getByRole("button", { name: /omitir \(demo\)/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no corresponde a la marca esperada/i);
  });

  it("cuando todas las marcas del recorrido ya se resolvieron, ofrece continuar o finalizar el turno", () => {
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={1} />);

    expect(screen.getByText(/recorrido completado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^escanear$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /omitir escaneo \(demo\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finalizar turno/i })).toBeInTheDocument();
  });

  it("al finalizar el turno desde el recorrido completado, llama la acción y redirige al selector de sitio", async () => {
    const user = userEvent.setup();
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={1} />);

    await user.click(screen.getByRole("button", { name: /finalizar turno/i }));

    expect(finalizarTurnoActionMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/guard/select-site");
  });

  it("no arranca el siguiente recorrido de forma automática al completar el actual", () => {
    // Con un solo registro ya resuelto (estado "a-tiempo"), el recorrido
    // está completo — la tarjeta de "Recorrido completado" debe aparecer,
    // no una lista con un nuevo registro "pendiente" ya en curso.
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={1} />);

    expect(screen.getByText(/recorrido completado/i)).toBeInTheDocument();
    expect(screen.queryByTestId(/registro-/)).not.toBeInTheDocument();
  });

  it("muestra la hora de inicio y el fin estimado del recorrido activo en el encabezado", () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);

    // toLocaleTimeString() usa un espacio angosto (U+202F) antes de "m.", pero
    // RTL normaliza los espacios del DOM a " " al comparar: el regex debe
    // aceptar cualquier espacio en blanco, no el literal.
    const iniciadoEn = recorrido.iniciadoEn.toLocaleTimeString().replace(/\s+/g, "\\s+");
    const cierraEn = recorrido.registros[0].cierraEn.toLocaleTimeString().replace(/\s+/g, "\\s+");
    expect(screen.getByText(new RegExp(`Recorrido iniciado a las ${iniciadoEn}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Fin estimado ${cierraEn}`))).toBeInTheDocument();
  });
});
