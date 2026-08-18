"use client";

import { useEffect, useState } from "react";

/** Hora actual del cliente, actualizada cada `intervalMs`. Empieza en 0 (SSR-safe) hasta el primer tick. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
