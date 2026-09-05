import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useActionSuccess } from "./use-action-success";

describe("useActionSuccess", () => {
  it("no dispara onSuccess en el render inicial, aunque ya empiece sin error y sin pendiente", () => {
    const onSuccess = vi.fn();
    renderHook(({ isPending, hasError }) => useActionSuccess(isPending, hasError, onSuccess), {
      initialProps: { isPending: false, hasError: false },
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("dispara onSuccess al pasar de pendiente a resuelto sin error", () => {
    const onSuccess = vi.fn();
    const { rerender } = renderHook(({ isPending, hasError }) => useActionSuccess(isPending, hasError, onSuccess), {
      initialProps: { isPending: false, hasError: false },
    });

    rerender({ isPending: true, hasError: false });
    expect(onSuccess).not.toHaveBeenCalled();

    rerender({ isPending: false, hasError: false });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("no dispara onSuccess al pasar de pendiente a resuelto CON error", () => {
    const onSuccess = vi.fn();
    const { rerender } = renderHook(({ isPending, hasError }) => useActionSuccess(isPending, hasError, onSuccess), {
      initialProps: { isPending: false, hasError: false },
    });

    rerender({ isPending: true, hasError: false });
    rerender({ isPending: false, hasError: true });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("no vuelve a disparar onSuccess en renders posteriores sin una nueva transición pendiente→resuelto", () => {
    const onSuccess = vi.fn();
    const { rerender } = renderHook(({ isPending, hasError }) => useActionSuccess(isPending, hasError, onSuccess), {
      initialProps: { isPending: false, hasError: false },
    });

    rerender({ isPending: true, hasError: false });
    rerender({ isPending: false, hasError: false });
    expect(onSuccess).toHaveBeenCalledTimes(1);

    rerender({ isPending: false, hasError: false });
    rerender({ isPending: false, hasError: false });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
