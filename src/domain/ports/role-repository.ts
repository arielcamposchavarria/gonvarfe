export interface RoleOption {
  id: string;
  name: string;
}

export interface RoleRepository {
  findAll(): Promise<RoleOption[]>;
}
