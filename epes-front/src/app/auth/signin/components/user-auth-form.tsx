"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Github, Mail } from "lucide-react";

import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function UserAuthForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const form = event.target as HTMLFormElement;
    const username = form.username.value;
    const password = form.password.value;

    const result = await signIn("credentials", {
      redirect: false,
      username: username,
      password: password,
      callbackUrl: "/",
    });

    if (result?.error) {
      toast({
        duration: 5000,
        variant: "destructive",
        title: `Нэвтрэх амжилтгүй. ${result.error}`,
      });
    } else {
      toast({
        title: "Амжилттай нэвтэрлээ.",
        className: "bg-[#008000] text-white",
      });
      router.push("/");
    }

    setIsLoading(false);
  }

  async function handleSocialLogin(provider: string) {
    setIsLoading(true);
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast({
          duration: 5000,
          variant: "destructive",
          title: `Нэвтрэх амжилтгүй. ${result.error}`,
        });
      } else {
        toast({
          title: "Амжилттай нэвтэрлээ.",
          className: "bg-[#008000] text-white",
        });
        router.push("/");
      }
    } catch (error) {
      toast({
        duration: 5000,
        variant: "destructive",
        title: "Нэвтрэхэд алдаа гарлаа.",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="username"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                placeholder="password"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <span>Loading...</span> : "Нэвтрэх"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground"></span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin("github")}
          className="flex-1"
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </>
          )}
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin("google")}
          className="flex-1"
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
