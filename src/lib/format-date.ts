const LOCALE = "es-CR";
const TIME_ZONE = "America/Costa_Rica";

/**
 * `Date.prototype.toLocaleString()` sin argumentos usa el locale/timezone
 * del entorno donde CORRE el código — en las páginas de admin (Server
 * Components) eso es el runtime de Node del servidor (Railway/Vercel),
 * casi nunca Costa Rica, así que las horas salían corridas varias horas y
 * con un formato distinto al que ven los guards (cuyas vistas son client
 * components, formateadas en SU propio navegador). Fijar locale y
 * timeZone explícitos hace que el resultado sea el mismo sin importar
 * dónde corra el servidor.
 */
export function formatDateTimeCR(date: Date): string {
  return date.toLocaleString(LOCALE, { timeZone: TIME_ZONE });
}

export function formatDateCR(date: Date): string {
  return date.toLocaleDateString(LOCALE, { timeZone: TIME_ZONE });
}

export function formatTimeCR(date: Date): string {
  return date.toLocaleTimeString(LOCALE, { timeZone: TIME_ZONE });
}
