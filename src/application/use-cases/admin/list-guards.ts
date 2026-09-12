import type { UserRepository } from "@/domain/ports/user-repository";
import type { GuardUser } from "@/domain/entities/user";

export interface ListGuardsDeps {
  userRepository: UserRepository;
}

/** Solo guardas activos: uno desactivado no debe listarse aquí. */
export async function listGuards({ userRepository }: ListGuardsDeps): Promise<GuardUser[]> {
  const guards = await userRepository.findByRole("guard");
  return (guards as GuardUser[]).filter((guard) => guard.isActive);
}
