/**
 * Un recorrido siempre dura 1 hora a partir del momento exacto en que se
 * escanea (o se salta) el primer QR. Ya no hay restricción de tiempo por
 * estación (se puede escanear cualquier marca pendiente en cualquier
 * momento) — lo único que se respeta es este tiempo total: pasado, el
 * recorrido vence y las marcas que quedaron sin escanear se reportan aparte.
 * El backend es la fuente de verdad; esta constante solo documenta la regla
 * para quien lea la UI.
 */
export const ROUND_DURATION_MINUTES = 60;

/** Minutos antes de que termine el recorrido en que se avisa al guard. */
export const NOTIFY_BEFORE_ROUND_CLOSE_MINUTES = 10;

/** Máximo de imágenes adjuntas por bitácora (ingreso o incidencia). */
export const MAX_LOG_IMAGES = 5;
