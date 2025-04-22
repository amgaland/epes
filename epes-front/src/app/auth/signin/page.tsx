import { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./components/user-auth-form";

export const metadata: Metadata = {
  title: "Sign In | EPES",
  description: "Sign-in page for the Employee Performance Evaluation System.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Image
            priority
            alt="EPES Logo"
            src="/light/epes.png"
            height={80}
            width={120}
          />
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
