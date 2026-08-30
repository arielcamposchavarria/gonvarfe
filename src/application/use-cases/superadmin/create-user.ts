import type { CreateUserInput, UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

export { UsernameTakenError } from "@/domain/ports/user-repository";

export interface CreateUserDeps {
  userRepository: UserRepository;
}

export async function createUser({ userRepository }: CreateUserDeps, input: CreateUserInput): Promise<AppUser> {
  return userRepository.create(input);
}
