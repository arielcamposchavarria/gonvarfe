/**
 * Un recorrido siempre dura 1 hora a partir del momento exacto en que se
 * escanea (o se salta) el primer QR, repartida en partes iguales entre las
 * estaciones del sitio (la cantidad de estaciones varía por sitio). El
 * reparto real lo calcula el backend (fuente de verdad); esta constante solo
 * documenta la regla para quien lea la UI.
 */
export const ROUND_DURATION_MINUTES = 60;

/** Minutos antes de que cierre la ventana de una estación en que se avisa al guard. */
export const NOTIFY_BEFORE_WINDOW_CLOSE_MINUTES = 3;

/** Máximo de imágenes adjuntas por bitácora (ingreso o incidencia). */
export const MAX_LOG_IMAGES = 5;
