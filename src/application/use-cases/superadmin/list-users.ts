import type { UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

export interface ListUsersDeps {
  userRepository: UserRepository;
}

export async function listUsers({ userRepository }: ListUsersDeps): Promise<AppUser[]> {
  return userRepository.findAll();
}
