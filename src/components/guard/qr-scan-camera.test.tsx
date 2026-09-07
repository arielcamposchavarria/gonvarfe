import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

interface MockDecodeResult {
  data: string;
}

interface MockQrScannerOptions {
  onDecodeError?: (error: Error | string) => void;
}

const { hasCameraMock, startMock, stopMock, destroyMock, instances } = vi.hoisted(() => ({
  hasCameraMock: vi.fn(),
  startMock: vi.fn(),
  stopMock: vi.fn(),
  destroyMock: vi.fn(),
  instances: [] as {
    onDecodeCallback: (result: MockDecodeResult) => void;
    onDecodeErrorCallback?: (error: Error | string) => void;
  }[],
}));

vi.mock("qr-scanner", () => {
  class MockQrScanner {
    static hasCamera = hasCameraMock;
    static NO_QR_CODE_FOUND = "No QR code found";
    onDecodeCallback: (result: MockDecodeResult) => void;
    onDecodeErrorCallback?: (error: Error | string) => void;
    start = startMock;
    stop = stopMock;
    destroy = destroyMock;

    constructor(
      _video: HTMLVideoElement,
      onDecode: (result: MockDecodeResult) => void,
      options?: MockQrScannerOptions,
    ) {
      this.onDecodeCallback = onDecode;
      this.onDecodeErrorCallback = options?.onDecodeError;
      instances.push(this);
    }
  }
  return { default: MockQrScanner };
});

import { QrScanCamera } from "./qr-scan-camera";

describe("QrScanCamera", () => {
  beforeEach(() => {
    instances.length = 0;
    hasCameraMock.mockReset().mockResolvedValue(true);
    startMock.mockReset().mockResolvedValue(undefined);
    stopMock.mockReset();
    destroyMock.mockReset();
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }) },
      configurable: true,
    });
  });

  it("decodifica un QR y notifica onDecode con el valor leído", async () => {
    const onDecode = vi.fn();
    render(<QrScanCamera onDecode={onDecode} />);

    await waitFor(() => expect(instances).toHaveLength(1));
    instances[0].onDecodeCallback({ data: "qr-abc" });

    expect(onDecode).toHaveBeenCalledWith("qr-abc");
  });

  it("muestra un mensaje claro cuando el permiso de cámara es denegado, sin crashear", async () => {
    startMock.mockRejectedValue(Object.assign(new Error("denied"), { name: "NotAllowedError" }));

    render(<QrScanCamera onDecode={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/permiso de cámara denegado/i);
  });

  it("muestra un mensaje claro cuando no hay cámara disponible", async () => {
    hasCameraMock.mockResolvedValue(false);

    render(<QrScanCamera onDecode={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/no se encontró una cámara/i);
    expect(startMock).not.toHaveBeenCalled();
  });

  it("muestra un mensaje de error (no se queda colgado) si hasCamera() lanza, p. ej. porque navigator.mediaDevices es undefined en un origen inseguro", async () => {
    hasCameraMock.mockRejectedValue(new TypeError("Cannot read properties of undefined (reading 'enumerateDevices')"));

    render(<QrScanCamera onDecode={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo iniciar la cámara/i);
    expect(startMock).not.toHaveBeenCalled();
  });

  it("detiene y destruye el scanner al desmontar (limpieza)", async () => {
    const { unmount } = render(<QrScanCamera onDecode={vi.fn()} />);
    await waitFor(() => expect(instances).toHaveLength(1));

    unmount();

    expect(stopMock).toHaveBeenCalled();
    expect(destroyMock).toHaveBeenCalled();
  });

  it("no reinicia la cámara si el padre le pasa un onDecode con nueva identidad en cada render", async () => {
    // Regresión: un padre que re-renderiza seguido (p. ej. por un reloj con
    // useNow) y recrea `onDecode` en cada render no debe hacer que la cámara
    // se apague y prenda — eso rompía el escaneo en dispositivos reales.
    const decodedValues: string[] = [];

    function Wrapper() {
      const [tick, setTick] = useState(0);
      return (
        <>
          <button onClick={() => setTick((t) => t + 1)}>tick</button>
          <QrScanCamera onDecode={(value) => decodedValues.push(`${value}-${tick}`)} />
        </>
      );
    }

    const { rerender } = render(<Wrapper />);
    await waitFor(() => expect(instances).toHaveLength(1));

    rerender(<Wrapper />);
    screen.getByText("tick").click();
    rerender(<Wrapper />);

    // Sigue siendo la misma instancia del scanner: no se reinició.
    expect(instances).toHaveLength(1);
    expect(stopMock).not.toHaveBeenCalled();
    expect(startMock).toHaveBeenCalledTimes(1);

    // Y usa la versión más reciente del callback.
    instances[0].onDecodeCallback({ data: "qr-xyz" });
    expect(decodedValues).toEqual(["qr-xyz-1"]);
  });

  describe("errores de decodificación", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("ignora silenciosamente 'No QR code found' (caso normal, se dispara constantemente)", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      render(<QrScanCamera onDecode={vi.fn()} />);
      await waitFor(() => expect(instances).toHaveLength(1));

      instances[0].onDecodeErrorCallback?.("No QR code found");

      expect(consoleError).not.toHaveBeenCalled();
    });

    it("ignora 'Scanner error: No QR code found' — variante real de la ruta nativa BarcodeDetector en Android/Chrome, que envuelve el sentinel en vez de lanzarlo tal cual", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      render(<QrScanCamera onDecode={vi.fn()} />);
      await waitFor(() => expect(instances).toHaveLength(1));

      instances[0].onDecodeErrorCallback?.("Scanner error: No QR code found");

      expect(consoleError).not.toHaveBeenCalled();
    });

    it("registra en consola un error real del motor de escaneo (antes se perdía en un console.log silencioso)", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      render(<QrScanCamera onDecode={vi.fn()} />);
      await waitFor(() => expect(instances).toHaveLength(1));

      instances[0].onDecodeErrorCallback?.("Scanner error: timeout");

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("error al decodificar"),
        "Scanner error: timeout",
      );
    });
  });

  describe("aviso de 'no logra escanear'", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("muestra un aviso con sugerencias tras varios segundos activa sin decodificar nada", async () => {
      render(<QrScanCamera onDecode={vi.fn()} />);
      // Deja que las promesas ya resueltas de hasCamera()/start() (mocks)
      // terminen de encadenarse, dentro de act(), antes de avanzar el reloj
      // falso — si no, React pierde el setState("active") que arma el timer.
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(screen.queryByText(/iniciando cámara/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/no logra escanear/i)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(8000);
      });

      expect(screen.getByText(/no logra escanear/i)).toBeInTheDocument();
    });

    it("no muestra el aviso si logra decodificar antes de que pase el tiempo", async () => {
      const onDecode = vi.fn();
      render(<QrScanCamera onDecode={onDecode} />);
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(4000);
      });
      act(() => {
        instances[0].onDecodeCallback({ data: "qr-abc" });
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(8000);
      });

      expect(screen.queryByText(/no logra escanear/i)).not.toBeInTheDocument();
    });
  });
});
