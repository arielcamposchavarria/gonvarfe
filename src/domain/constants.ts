/**
 * Un recorrido siempre dura 1 hora, repartida en partes iguales entre las
 * estaciones del sitio (la cantidad de estaciones varía por sitio).
 */
export const ROUND_DURATION_MINUTES = 60;

/**
 * Ventana máxima para escanear cada estación, sin importar cuántas estaciones
 * tenga el sitio. Si repartir ROUND_DURATION_MINUTES entre las estaciones da
 * un valor mayor, se limita a este máximo (el recorrido puede terminar antes
 * de la hora completa).
 */
export const MAX_STATION_WINDOW_MINUTES = 2;

/** Minutos antes de que cierre la ventana de una estación en que se avisa al guard. */
export const NOTIFY_BEFORE_WINDOW_CLOSE_MINUTES = 3;

/** Máximo de imágenes adjuntas por bitácora (ingreso o incidencia). */
export const MAX_LOG_IMAGES = 5;
