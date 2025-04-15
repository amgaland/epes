// src/app/protected/dashboard/components/RoleGuard.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Role } from "../types";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      !roles.some((r) => allowedRoles.includes(r as Role))
    ) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this dashboard.",
        variant: "destructive",
      });
      router.push("/protected");
    }
  }, [status, roles, allowedRoles, router, toast]);

  if (
    status === "loading" ||
    !roles.some((r) => allowedRoles.includes(r as Role))
  ) {
    return null;
  }

  return <>{children}</>;
}
