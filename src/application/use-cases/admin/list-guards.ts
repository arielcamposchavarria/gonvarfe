import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";

export interface ListGuardsDeps {
  userRepository: UserRepository;
}

export async function listGuards({ userRepository }: ListGuardsDeps): Promise<GuardUser[]> {
  const guards = await userRepository.findByRole("guard");
  return guards as GuardUser[];
}
