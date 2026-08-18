export interface TimeWindow {
  readonly opensAt: Date;
  readonly closesAt: Date;
}

export function createTimeWindow(opensAt: Date, durationMinutes: number): TimeWindow {
  return {
    opensAt,
    closesAt: new Date(opensAt.getTime() + durationMinutes * 60_000),
  };
}

/** El guard no puede escanear la estación antes de que abra su ventana. */
export function hasWindowOpened(window: TimeWindow, at: Date): boolean {
  return at.getTime() >= window.opensAt.getTime();
}

export function isWithinWindow(window: TimeWindow, at: Date): boolean {
  return at.getTime() >= window.opensAt.getTime() && at.getTime() <= window.closesAt.getTime();
}

export function isWindowExpired(window: TimeWindow, at: Date): boolean {
  return at.getTime() > window.closesAt.getTime();
}
