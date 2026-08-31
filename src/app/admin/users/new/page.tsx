import { container } from "@/infrastructure/container";
import { CreateUserForm } from "@/components/admin/create-user-form";

// Un admin nunca puede crear un superAdmin (regla de negocio validada
// también en el backend); se filtra ese rol antes de mostrar el selector.
export default async function AdminNewUserPage() {
  const roles = await container.listRoles();
  const assignableRoles = roles.filter((role) => role.name !== "superAdmin");

  return <CreateUserForm roles={assignableRoles.map((role) => ({ id: role.id, name: role.name }))} />;
}
