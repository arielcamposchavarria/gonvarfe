export interface DateRange {
  from?: Date;
  to?: Date;
}

/** Normaliza un valor de searchParams (posiblemente un array) a un string de fecha o undefined. */
export function firstDateParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.trim().length > 0 ? raw.trim() : undefined;
}

/** Extrae un rango de fechas de los query params `from`/`to` (YYYY-MM-DD, inclusivos). */
export function parseDateRangeParams(params: URLSearchParams | Record<string, string | string[] | undefined>): DateRange {
  const get = (key: string) => (params instanceof URLSearchParams ? (params.get(key) ?? undefined) : params[key]);

  const from = firstDateParam(get("from"));
  const to = firstDateParam(get("to"));

  return {
    from: from ? new Date(`${from}T00:00:00`) : undefined,
    to: to ? new Date(`${to}T23:59:59.999`) : undefined,
  };
}

/** Construye el query string (?from=...&to=...) a partir de valores ya normalizados. */
export function buildDateRangeQuery(params: { from?: string; to?: string }): string {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function isWithinDateRange(date: Date, range: DateRange): boolean {
  if (range.from && date.getTime() < range.from.getTime()) return false;
  if (range.to && date.getTime() > range.to.getTime()) return false;
  return true;
}
