import { describe, expect, it, vi } from "vitest";

import { listMyEntryLogs } from "./list-my-entry-logs";
import type { EntryLogRepository } from "@/domain/ports/entry-log-repository";

describe("listMyEntryLogs", () => {
  it("reenvía el guardId al repositorio", async () => {
    const findByGuard = vi.fn().mockResolvedValue([]);
    const entryLogRepository: EntryLogRepository = {
      findBySite: vi.fn(),
      findByGuard,
      create: vi.fn(),
      registrarSalida: vi.fn(),
    };

    await listMyEntryLogs({ entryLogRepository }, "guard-1");

    expect(findByGuard).toHaveBeenCalledWith("guard-1");
  });
});
