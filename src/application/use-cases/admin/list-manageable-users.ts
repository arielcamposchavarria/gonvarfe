import type { UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

export interface ListManageableUsersDeps {
  userRepository: UserRepository;
}

/** Usuarios que un admin puede gestionar: guardas y otros administradores (nunca superAdmin). */
export async function listManageableUsers({
  userRepository,
}: ListManageableUsersDeps): Promise<AppUser[]> {
  const [guards, admins] = await Promise.all([
    userRepository.findByRole("guard"),
    userRepository.findByRole("admin"),
  ]);
  return [...admins, ...guards];
}
