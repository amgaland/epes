// src/app/protected/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RoleGuard } from "./components/RoleGuard";
import AdminDashboardPage from "./admin/page";
import ManagerDashboardPage from "./manager/page";
import EmployeeDashboardPage from "./employee/page";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <>
      {roles.includes("ADMIN") && (
        <RoleGuard allowedRoles={["ADMIN"]}>
          <AdminDashboardPage />
        </RoleGuard>
      )}
      {roles.includes("MANAGER") && (
        <RoleGuard allowedRoles={["MANAGER"]}>
          <ManagerDashboardPage />
        </RoleGuard>
      )}
      {roles.includes("EMPLOYEE") && (
        <RoleGuard allowedRoles={["EMPLOYEE"]}>
          <EmployeeDashboardPage />
        </RoleGuard>
      )}
    </>
  );
}
