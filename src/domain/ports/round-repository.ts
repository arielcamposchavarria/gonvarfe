import type { Round } from "../entities/round";

export interface RoundRepository {
  findById(id: string): Promise<Round | null>;
  findActiveByShiftSession(shiftSessionId: string): Promise<Round | null>;
  findByShiftSession(shiftSessionId: string): Promise<Round[]>;
  create(round: Round): Promise<Round>;
  update(round: Round): Promise<Round>;
}
