"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginAction, type LoginActionState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notifySuccess } from "@/lib/confirm";
import { useActionSuccess } from "@/lib/hooks/use-action-success";

const initialState: LoginActionState = { error: null, redirectTo: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useActionSuccess(isPending, Boolean(state.error), () => {
    if (!state.redirectTo) return;
    void notifySuccess("Bienvenido").then(() => router.push(state.redirectTo!));
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>GonVar · Rondas de seguridad</CardTitle>
        <CardDescription>Ingrese con su usuario y contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" name="username" type="text" autoComplete="username" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>
          <Link href="/login/recover" className="text-center text-sm text-muted-foreground hover:text-foreground">
            ¿Olvidó su usuario o contraseña?
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
