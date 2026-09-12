import { act, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { RoundScanBoard } from "./round-scan-board";
import type { GuardSitio } from "@/domain/entities/guard-sitio";
import type { Recorrido } from "@/domain/entities/recorrido";
import type { Registro } from "@/domain/entities/registro";
import type { RegistroPendienteAnterior } from "@/application/use-cases/guard/obtener-estado-turno";

const {
  registrarEscaneoActionMock,
  reportarPerdidoActionMock,
  finalizarTurnoActionMock,
  pushMock,
  refreshMock,
  notifyErrorMock,
  notifySuccessMock,
  confirmActionMock,
} = vi.hoisted(() => ({
  registrarEscaneoActionMock: vi.fn(),
  reportarPerdidoActionMock: vi.fn(),
  finalizarTurnoActionMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  notifyErrorMock: vi.fn(),
  notifySuccessMock: vi.fn(),
  confirmActionMock: vi.fn(),
}));

vi.mock("@/app/guard/actions", () => ({
  registrarEscaneoAction: registrarEscaneoActionMock,
  reportarPerdidoAction: reportarPerdidoActionMock,
  finalizarTurnoAction: finalizarTurnoActionMock,
}));

vi.mock("@/lib/confirm", () => ({
  notifyError: notifyErrorMock,
  notifySuccess: notifySuccessMock,
  confirmAction: confirmActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
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
    cierraEn: new Date(NOW + 30 * 60_000),
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

function baseProps() {
  return { sitio: SITIO, recorridosCompletados: 0, pendientesRecorridoAnterior: [] as RegistroPendienteAnterior[] };
}

describe("RoundScanBoard", () => {
  beforeEach(() => {
    registrarEscaneoActionMock.mockReset().mockResolvedValue({ error: null });
    reportarPerdidoActionMock.mockReset().mockResolvedValue({ error: null });
    finalizarTurnoActionMock.mockReset().mockResolvedValue({ error: null });
    pushMock.mockReset();
    refreshMock.mockReset();
    notifyErrorMock.mockReset().mockResolvedValue(undefined);
    notifySuccessMock.mockReset().mockResolvedValue(undefined);
    confirmActionMock.mockReset().mockResolvedValue(true);
  });

  it("sin recorrido activo, ofrece iniciar el recorrido escaneando o saltando (camino de saltar)", async () => {
    const user = userEvent.setup();
    render(<RoundScanBoard {...baseProps()} recorridoActivo={null} />);

    expect(screen.getByText(/iniciar recorrido/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /omitir escaneo \(demo\)/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    expect(registrarEscaneoActionMock).toHaveBeenCalledWith({ skip: true });
  });

  it("sin recorrido activo, tambien ofrece 'No pude escanear' para el primer escaneo del recorrido", async () => {
    const user = userEvent.setup();
    render(<RoundScanBoard {...baseProps()} recorridoActivo={null} />);

    await user.click(screen.getByRole("button", { name: /no pude escanear/i }));
    await user.type(await screen.findByLabelText(/motivo/i), "Camara descompuesta");
    await user.click(screen.getByRole("button", { name: /^reportar$/i }));

    await waitFor(() =>
      expect(reportarPerdidoActionMock).toHaveBeenCalledWith(
        expect.objectContaining({ motivo: "Camara descompuesta", recorridoId: undefined, registroId: undefined }),
      ),
    );
  });

  it("'Escanear' y 'Omitir (demo)' quedan habilitados aunque la ventana individual de la marca objetivo aun no haya abierto", () => {
    const recorrido = buildRecorrido([
      buildRegistro({ abreEn: new Date(NOW + 60_000), cierraEn: new Date(NOW + 30 * 60_000) }),
    ]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    expect(screen.getByRole("button", { name: /^escanear$/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /omitir \(demo\)/i })).toBeEnabled();
  });

  it("'Escanear' y 'Omitir (demo)' siguen habilitados aunque la ventana individual de la marca objetivo ya haya cerrado, y muestra siempre la hora estimada", () => {
    const recorrido = buildRecorrido([
      buildRegistro({
        id: "r1",
        marcaId: "marca-1",
        orden: 1,
        abreEn: new Date(NOW - 120_000),
        cierraEn: new Date(NOW - 60_000),
      }),
      buildRegistro({
        id: "r2",
        marcaId: "marca-2",
        orden: 2,
        abreEn: new Date(NOW - 60_000),
        cierraEn: new Date(NOW + 30 * 60_000),
      }),
    ]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    expect(screen.getByRole("button", { name: /^escanear$/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /omitir \(demo\)/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /no pude escanear/i })).toBeEnabled();
    expect(screen.queryByText(/venció/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/hora estimada/i).length).toBeGreaterThan(0);
  });

  it("abre la cámara al presionar 'Escanear' (camino de cámara)", async () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);
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
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);
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
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);
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
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    expect(screen.getAllByRole("button", { name: /^escanear$/i })).toHaveLength(1);
    expect(screen.getByText("Área de carga")).toBeInTheDocument();
  });

  it("al registrar un escaneo exitoso, muestra un SweetAlert de confirmación", async () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    renderTicked(<RoundScanBoard sitio={SITIO} recorridoActivo={recorrido} recorridosCompletados={0} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /^escanear$/i }));
    await user.click(screen.getByRole("button", { name: /simular-decodificacion/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Escaneo registrado"));
    expect(notifyErrorMock).not.toHaveBeenCalled();
  });

  it("al omitir un escaneo (demo) exitosamente, muestra un SweetAlert distinto al de escaneo real", async () => {
    const user = userEvent.setup();
    render(<RoundScanBoard sitio={SITIO} recorridoActivo={null} recorridosCompletados={0} />);

    await user.click(screen.getByRole("button", { name: /omitir escaneo \(demo\)/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    await waitFor(() => expect(notifySuccessMock).toHaveBeenCalledWith("Registro omitido"));
  });

  it("muestra el error de secuencia inválida / QR incorrecto como SweetAlert, no como banner", async () => {
    registrarEscaneoActionMock.mockResolvedValue({
      error: "El código QR no corresponde a la marca esperada. Respete el orden del recorrido.",
    });
    const user = userEvent.setup();
    const recorrido = buildRecorrido([buildRegistro({})]);
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    await user.click(screen.getByRole("button", { name: /omitir \(demo\)/i }));
    await user.click(await screen.findByRole("button", { name: /^confirmar$/i }));

    await waitFor(() =>
      expect(notifyErrorMock).toHaveBeenCalledWith(
        "No se pudo registrar el escaneo",
        "El código QR no corresponde a la marca esperada. Respete el orden del recorrido.",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("cuando todas las marcas del recorrido ya se resolvieron, ofrece continuar o finalizar el turno", () => {
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} recorridosCompletados={1} />);

    expect(screen.getByText(/recorrido completado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^escanear$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /omitir escaneo \(demo\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finalizar turno/i })).toBeInTheDocument();
  });

  it("al finalizar el turno desde el recorrido completado, llama la acción y redirige al selector de sitio", async () => {
    const user = userEvent.setup();
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} recorridosCompletados={1} />);

    await user.click(screen.getByRole("button", { name: /finalizar turno/i }));

    await waitFor(() => expect(finalizarTurnoActionMock).toHaveBeenCalled());
    expect(pushMock).toHaveBeenCalledWith("/guard/select-site");
  });

  it("pide confirmación antes de finalizar el turno, y no llama la acción si se cancela", async () => {
    confirmActionMock.mockResolvedValue(false);
    const user = userEvent.setup();
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} recorridosCompletados={1} />);

    await user.click(screen.getByRole("button", { name: /finalizar turno/i }));

    expect(finalizarTurnoActionMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("no arranca el siguiente recorrido de forma automática al completar el actual", () => {
    // Con un solo registro ya resuelto (estado "a-tiempo"), el recorrido
    // está completo — la tarjeta de "Recorrido completado" debe aparecer,
    // no una lista con un nuevo registro "pendiente" ya en curso.
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW) })]);
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} recorridosCompletados={1} />);

    expect(screen.getByText(/recorrido completado/i)).toBeInTheDocument();
    expect(screen.queryByTestId(/registro-/)).not.toBeInTheDocument();
  });

  it("muestra la hora de inicio y el fin estimado del recorrido activo en el encabezado", () => {
    const recorrido = buildRecorrido([buildRegistro({})]);
    render(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    // toLocaleTimeString() usa un espacio angosto (U+202F) antes de "m.", pero
    // RTL normaliza los espacios del DOM a " " al comparar: el regex debe
    // aceptar cualquier espacio en blanco, no el literal.
    const iniciadoEn = recorrido.iniciadoEn.toLocaleTimeString().replace(/\s+/g, "\\s+");
    const cierraEn = recorrido.registros[0].cierraEn.toLocaleTimeString().replace(/\s+/g, "\\s+");
    expect(screen.getByText(new RegExp(`Recorrido iniciado a las ${iniciadoEn}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Fin estimado ${cierraEn}`))).toBeInTheDocument();
  });

  it("avisa 10 minutos antes de que termine el recorrido, si quedan marcas pendientes", () => {
    const recorrido = buildRecorrido([
      buildRegistro({ id: "r1", cierraEn: new Date(NOW + 5 * 60_000) }),
    ]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    expect(screen.getByRole("status")).toHaveTextContent(/está por finalizar.*tienes marcas pendientes/i);
  });

  it("avisa 10 minutos antes de que termine el recorrido, indicando la hora del siguiente, si ya se escanearon todas las marcas", () => {
    const recorrido = buildRecorrido([
      buildRegistro({ id: "r1", estado: "a-tiempo", escaneadoEn: new Date(NOW), cierraEn: new Date(NOW + 5 * 60_000) }),
    ]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} recorridosCompletados={1} />);

    expect(screen.getByRole("status")).toHaveTextContent(/el siguiente recorrido inicia aproximadamente/i);
  });

  it("no avisa si faltan más de 10 minutos para que termine el recorrido", () => {
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", cierraEn: new Date(NOW + 20 * 60_000) })]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("cuando se cumple el tiempo total del recorrido y quedan marcas pendientes, refresca la página una sola vez", () => {
    const recorrido = buildRecorrido([buildRegistro({ id: "r1", cierraEn: new Date(NOW - 1_000) })]);
    renderTicked(<RoundScanBoard {...baseProps()} recorridoActivo={recorrido} />);

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("muestra las marcas pendientes de un recorrido anterior y permite reportarlas con recorridoId/registroId", async () => {
    const user = userEvent.setup();
    const pendiente: RegistroPendienteAnterior = {
      recorridoId: "recorrido-viejo",
      registro: buildRegistro({ id: "registro-3", marcaId: "marca-2", orden: 2, estado: "pendiente" }),
    };
    render(
      <RoundScanBoard
        {...baseProps()}
        recorridoActivo={null}
        pendientesRecorridoAnterior={[pendiente]}
      />,
    );

    const seccionAnterior = screen.getByTestId("pendientes-recorrido-anterior");
    expect(within(seccionAnterior).getByText("Área de carga")).toBeInTheDocument();

    await user.click(within(seccionAnterior).getByRole("button", { name: /no pude escanear/i }));
    expect(await screen.findByText(/no pude escanear: área de carga/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/motivo/i), "Se cortó el turno antes de llegar");
    await user.click(screen.getByRole("button", { name: /^reportar$/i }));

    await waitFor(() =>
      expect(reportarPerdidoActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          motivo: "Se cortó el turno antes de llegar",
          recorridoId: "recorrido-viejo",
          registroId: "registro-3",
        }),
      ),
    );
  });
});
