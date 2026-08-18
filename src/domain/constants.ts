/** Un recorrido dura 1 hora repartida en 4 estaciones de 15 minutos cada una. */
export const STATIONS_PER_SITE = 4;
export const ROUND_DURATION_MINUTES = 60;
export const STATION_WINDOW_MINUTES = ROUND_DURATION_MINUTES / STATIONS_PER_SITE;

/** Minutos antes de que cierre la ventana de una estación en que se avisa al guard. */
export const NOTIFY_BEFORE_WINDOW_CLOSE_MINUTES = 3;

/** Máximo de imágenes adjuntas por bitácora (ingreso o incidencia). */
export const MAX_LOG_IMAGES = 5;
