"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  requestRecoveryCodeAction,
  resetPasswordWithCodeAction,
  verifyRecoveryCodeAction,
} from "@/app/login/recover/actions";
import type { RecoveryType } from "@/domain/ports/recovery-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Step = "choose" | "email" | "code" | "reset" | "done";

export function RecoverAccountForm() {
  const [step, setStep] = useState<Step>("choose");
  const [type, setType] = useState<RecoveryType | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [recoveredUsername, setRecoveredUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function chooseType(chosen: RecoveryType) {
    setType(chosen);
    setError(null);
    setStep("email");
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!type) return;
    setError(null);
    startTransition(async () => {
      const result = await requestRecoveryCodeAction(email, type);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep("code");
    });
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!type) return;
    setError(null);
    startTransition(async () => {
      const result = await verifyRecoveryCodeAction(email, code, type);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.type === "username") {
        setRecoveredUsername(result.username);
        setStep("done");
        return;
      }
      setStep("reset");
    });
  }

  function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    startTransition(async () => {
      const result = await resetPasswordWithCodeAction(email, code, password, confirmPassword);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep("done");
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Recuperar acceso</CardTitle>
        <CardDescription>{describeStep(step, type)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {step === "choose" && (
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => chooseType("username")}>
              Olvidé mi usuario
            </Button>
            <Button type="button" variant="secondary" onClick={() => chooseType("password")}>
              Olvidé mi contraseña
            </Button>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={submitEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recover-email">Correo electrónico</Label>
              <Input
                id="recover-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar código"}
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recover-code">Código de 4 dígitos</Label>
              <Input
                id="recover-code"
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Verificando..." : "Verificar código"}
            </Button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={submitNewPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recover-password">Nueva contraseña</Label>
              <Input id="recover-password" name="password" type="password" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="recover-confirm-password">Confirmar contraseña</Label>
              <Input id="recover-confirm-password" name="confirmPassword" type="password" required />
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-3">
            {type === "username" ? (
              <p>
                Tu usuario es: <strong>{recoveredUsername}</strong>
              </p>
            ) : (
              <p>Tu contraseña fue actualizada correctamente.</p>
            )}
            <Link href="/login" className="text-sm text-primary underline">
              Volver al inicio de sesión
            </Link>
          </div>
        )}

        {step !== "done" && (
          <Link
            href="/login"
            className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function describeStep(step: Step, type: RecoveryType | null): string {
  if (step === "choose") return "¿Qué olvidaste?";
  if (step === "email") return "Ingresa tu correo para enviarte un código.";
  if (step === "code") return "Ingresa el código de 4 dígitos que enviamos a tu correo.";
  if (step === "reset") return "Ingresa tu nueva contraseña.";
  return type === "username" ? "Usuario recuperado" : "Contraseña actualizada";
}

function ErrorText({ children }: { children: string }) {
  return (
    <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}
