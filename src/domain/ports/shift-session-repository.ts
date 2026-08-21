import type { ShiftSession } from "../entities/shift-session";

export interface ShiftSessionRepository {
  findById(id: string): Promise<ShiftSession | null>;
  findActiveByGuard(guardId: string): Promise<ShiftSession | null>;
  findByGuard(guardId: string): Promise<ShiftSession[]>;
  create(session: ShiftSession): Promise<ShiftSession>;
  update(session: ShiftSession): Promise<ShiftSession>;
}
