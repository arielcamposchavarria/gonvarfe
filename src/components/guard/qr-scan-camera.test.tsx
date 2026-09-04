import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

interface MockDecodeResult {
  data: string;
}

const { hasCameraMock, startMock, stopMock, destroyMock, instances } = vi.hoisted(() => ({
  hasCameraMock: vi.fn(),
  startMock: vi.fn(),
  stopMock: vi.fn(),
  destroyMock: vi.fn(),
  instances: [] as { onDecodeCallback: (result: MockDecodeResult) => void }[],
}));

vi.mock("qr-scanner", () => {
  class MockQrScanner {
    static hasCamera = hasCameraMock;
    onDecodeCallback: (result: MockDecodeResult) => void;
    start = startMock;
    stop = stopMock;
    destroy = destroyMock;

    constructor(_video: HTMLVideoElement, onDecode: (result: MockDecodeResult) => void) {
      this.onDecodeCallback = onDecode;
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
});
