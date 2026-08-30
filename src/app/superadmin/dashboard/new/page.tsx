import { container } from "@/infrastructure/container";
import { CreateUserForm } from "@/components/superadmin/create-user-form";

export default async function SuperAdminNewUserPage() {
  const roles = await container.listRoles();

  return <CreateUserForm roles={roles.map((role) => ({ id: role.id, name: role.name }))} />;
}
