"use server";

import { redirect } from "next/navigation";
import { destroySession } from "./session";

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
