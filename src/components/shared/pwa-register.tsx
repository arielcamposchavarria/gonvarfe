"use client";

import { useEffect } from "react";

/**
 * Registra el service worker solo en producción: en dev, un SW registrado
 * puede quedar "pegado" entre reinicios del servidor y servir bundles viejos.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalar la PWA sin service worker sigue siendo posible en algunos
      // navegadores; no hay nada útil que hacer con este error en runtime.
    });
  }, []);

  return null;
}
