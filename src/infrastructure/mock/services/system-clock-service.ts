import type { ClockService } from "@/domain/ports/clock-service";

export function createSystemClockService(): ClockService {
  return {
    now: () => new Date(),
  };
}
