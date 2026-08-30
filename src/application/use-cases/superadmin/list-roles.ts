import type { RoleOption, RoleRepository } from "@/domain/ports/role-repository";

export interface ListRolesDeps {
  roleRepository: RoleRepository;
}

export async function listRoles({ roleRepository }: ListRolesDeps): Promise<RoleOption[]> {
  return roleRepository.findAll();
}
