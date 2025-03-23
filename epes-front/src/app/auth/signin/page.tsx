import { Metadata } from "next";
import Image from "next/image";
import { UserAuthForm } from "./components/user-auth-form";

export const metadata: Metadata = {
  title: "Authentication | Admin",
  description: "Authentication for EPES | Admin.",
};

export default function AuthenticationPage() {
  return (
    <>
      <div className="container flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              priority
              alt="Logo"
              src={"/light/epes.png"}
              height={80}
              width={120}
            />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;EPES&rdquo;</p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Нэвтрэх</h1>
              <p className="text-sm text-muted-foreground">
                Нэвтрэх нэр болон нууц үгээ оруулна уу.
              </p>
            </div>
            <UserAuthForm />
          </div>
        </div>
      </div>
    </>
  );
}
