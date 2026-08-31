import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadDataUrl, qrFileName, svgToPngDataUrl } from "./svg-to-png";

describe("qrFileName", () => {
  it("normaliza nombre a minúsculas, sin tildes ni espacios", () => {
    expect(qrFileName("Banco BAC San José")).toBe("qr-banco-bac-san-jose.png");
  });

  it("recorta guiones sobrantes al inicio/fin y usa 'marca' si queda vacío", () => {
    expect(qrFileName("  ***  ")).toBe("qr-marca.png");
  });
});

describe("svgToPngDataUrl / downloadDataUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rasteriza el svg a un data URL usando canvas", async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:mock"), revokeObjectURL });

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", MockImage);

    const drawImage = vi.fn();
    const toDataURL = vi.fn(() => "data:image/png;base64,mock");
    vi.spyOn(document, "createElement").mockReturnValue(
      { width: 0, height: 0, getContext: () => ({ drawImage }), toDataURL } as unknown as HTMLCanvasElement,
    );

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as unknown as SVGSVGElement;
    const result = await svgToPngDataUrl(svg, 256);

    expect(result).toBe("data:image/png;base64,mock");
    expect(drawImage).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("dispara la descarga creando un <a download> y haciendo click", () => {
    const click = vi.fn();
    const anchor = { click, href: "", download: "" } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    downloadDataUrl("data:image/png;base64,mock", "qr-bac.png");

    expect(anchor.href).toBe("data:image/png;base64,mock");
    expect(anchor.download).toBe("qr-bac.png");
    expect(click).toHaveBeenCalled();
  });
});
