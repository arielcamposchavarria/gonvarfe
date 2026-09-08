import type { UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

export interface DeactivateUserDeps {
  userRepository: UserRepository;
}

export async function deactivateUser({ userRepository }: DeactivateUserDeps, userId: string): Promise<AppUser> {
  return userRepository.deactivate(userId);
}
