import type { UserRepository } from "@/domain/ports/user-repository";
import type { AuthService } from "@/domain/ports/auth-service";
import type { GuardUser } from "@/domain/entities/user";

export interface CreateGuardDeps {
  userRepository: UserRepository;
  authService: AuthService;
}

export interface CreateGuardInput {
  name: string;
  username: string;
  password: string;
  assignedSiteId: string;
}

export class UsernameTakenError extends Error {
  constructor(username: string) {
    super(`El usuario "${username}" ya existe.`);
    this.name = "UsernameTakenError";
  }
}

export async function createGuard(deps: CreateGuardDeps, input: CreateGuardInput): Promise<GuardUser> {
  const existing = await deps.userRepository.findByUsername(input.username);
  if (existing) throw new UsernameTakenError(input.username);

  const guard: GuardUser = {
    id: crypto.randomUUID(),
    name: input.name,
    username: input.username,
    role: "guard",
    assignedSiteId: input.assignedSiteId,
    isActive: true,
    createdAt: new Date(),
    photoUrl: null,
  };

  await deps.userRepository.create(guard);
  await deps.authService.registerCredentials(guard.id, input.password);

  return guard;
}
