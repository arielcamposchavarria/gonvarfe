import type { AccountRepository, UpdateOwnProfileInput } from "@/domain/ports/account-repository";
import type { AppUser } from "@/domain/entities/user";

export interface UpdateOwnProfileDeps {
  accountRepository: AccountRepository;
}

export async function updateOwnProfile(
  { accountRepository }: UpdateOwnProfileDeps,
  input: UpdateOwnProfileInput,
): Promise<AppUser> {
  return accountRepository.updateOwnProfile(input);
}
