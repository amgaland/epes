"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Header } from "@/components/header";
import { useRequireAuth } from "@/lib/checkAuth";
import { BarChart2, FileText, Users, Award } from "lucide-react";
import SideBar from "./components/side-bar";

export default function Home() {
  useRequireAuth();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Normalize roles
  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];

  // Role checks
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const isEmployee = roles.includes("EMPLOYEE"); // Assuming any role that's not admin/manager is employee

  // Redirect based on role
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (isAdmin) {
        router.push("/protected/dashboardAdmin");
      } else if (isManager) {
        router.push("/protected/dashboardManager");
      } else if (isEmployee) {
        router.push("/protected/dashboardEmployee");
      } else {
        // Fallback for users with no recognized roles
        router.push("/unauthorized");
      }
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, isAdmin, isManager, isEmployee, router]);

  // Render loading state or redirecting message
  return (
    <div className="flex min-h-screen bg-background">
      <SideBar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-1">
          {status === "loading" ? (
            <div className="text-center text-muted-foreground">
              Loading your dashboard...
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Redirecting to your dashboard...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
