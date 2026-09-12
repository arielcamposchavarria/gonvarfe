import type { UserRepository } from "@/domain/ports/user-repository";

export interface DeleteUserDeps {
  userRepository: UserRepository;
}

export async function deleteUser({ userRepository }: DeleteUserDeps, userId: string): Promise<void> {
  return userRepository.delete(userId);
}
