import type { AccountRepository, ChangePasswordInput } from "@/domain/ports/account-repository";

export interface ChangePasswordDeps {
  accountRepository: AccountRepository;
}

export async function changePassword(
  { accountRepository }: ChangePasswordDeps,
  input: ChangePasswordInput,
): Promise<void> {
  return accountRepository.changePassword(input);
}
