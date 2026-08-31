import type { UserRepository } from "@/domain/ports/user-repository";
import type { AppUser } from "@/domain/entities/user";

export interface AssignGuardSiteDeps {
  userRepository: UserRepository;
}

export interface AssignGuardSiteInput {
  guardId: string;
  siteId: string | null;
}

export async function assignGuardSite(
  { userRepository }: AssignGuardSiteDeps,
  input: AssignGuardSiteInput,
): Promise<AppUser> {
  return userRepository.assignSite(input.guardId, input.siteId);
}
