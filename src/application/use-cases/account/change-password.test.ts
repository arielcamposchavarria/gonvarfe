import { describe, expect, it, vi } from "vitest";

import { changePassword } from "./change-password";
import type { AccountRepository } from "@/domain/ports/account-repository";

describe("changePassword", () => {
  it("delega en el repositorio tal cual", async () => {
    const accountRepository: AccountRepository = {
      updateOwnProfile: vi.fn(),
      changePassword: vi.fn().mockResolvedValue(undefined),
    };

    await changePassword({ accountRepository }, { currentPassword: "actual", newPassword: "nueva1234" });

    expect(accountRepository.changePassword).toHaveBeenCalledWith({
      currentPassword: "actual",
      newPassword: "nueva1234",
    });
  });
});
