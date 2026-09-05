"use client";

import { useEffect, useRef } from "react";

/**
 * Dispara `onSuccess` una sola vez, justo en la transición de "pendiente" a
 * "resuelta sin error" de un `useActionState` (o cualquier `isPending`
 * booleano equivalente) — nunca en el render inicial, aunque el estado
 * inicial también tenga `hasError: false`. Se usa para reemplazar el patrón
 * de `redirect()` del lado servidor (que no deja mostrar nada en el cliente
 * antes de navegar) por "mostrar un SweetAlert y luego navegar", sin
 * duplicar el `useRef` + `useEffect` en cada formulario.
 */
export function useActionSuccess(isPending: boolean, hasError: boolean, onSuccess: () => void): void {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !hasError) {
      onSuccess();
    }
    wasPending.current = isPending;
  });
}
