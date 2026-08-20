import Image from "next/image";

import { LoginForm } from "@/components/shared/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <Image
        src="/WhatsApp Image 2026-08-16 at 16.55.58.jpeg"
        alt="GonVar Security"
        width={918}
        height={1022}
        priority
        className="h-40 w-auto rounded-2xl sm:h-48"
      />
      <LoginForm />
    </div>
  );
}
