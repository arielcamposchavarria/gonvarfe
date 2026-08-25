import { container } from "@/infrastructure/container";
import { CreateUserForm } from "@/components/superadmin/create-user-form";

export default async function SuperAdminNewUserPage() {
  const [roles, sites] = await Promise.all([container.listRoles(), container.listSites()]);

  return (
    <CreateUserForm
      roles={roles.map((role) => ({ id: role.id, name: role.name }))}
      sites={sites.map((site) => ({ id: site.id, name: site.name }))}
    />
  );
}
