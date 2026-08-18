import type { ShiftSession } from "../entities/shift-session";

export interface ShiftSessionRepository {
  findActiveByGuard(guardId: string): Promise<ShiftSession | null>;
  create(session: ShiftSession): Promise<ShiftSession>;
  update(session: ShiftSession): Promise<ShiftSession>;
}
