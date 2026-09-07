import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { container } from "@/infrastructure/container";
import { ProfileCard } from "@/components/shared/profile-card";
import { EditProfileForm } from "@/components/shared/edit-profile-form";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";
import { updateProfileAction, changePasswordAction } from "./actions";

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const admin = await container.findUserById(session.userId);
  if (!admin || admin.role !== "admin") redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <ProfileCard user={admin} />
      <EditProfileForm user={admin} action={updateProfileAction} />
      <ChangePasswordDialog action={changePasswordAction} />
    </div>
  );
}
