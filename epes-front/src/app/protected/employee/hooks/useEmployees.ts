// src/app/protected/employee/hooks/useEmployees.ts
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "../types";

export function useEmployees() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    activeEmployees: 0,
  });
  const role = Array.isArray(session?.user?.roles)
    ? session.user.roles[0]
    : session?.user?.roles;

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/protected/employees"); // Next.js proxy API
        const data = await res.json();

        setEmployees(data);
        setStats({
          totalEmployees: data.length,
          totalManagers: data.filter((e: Employee) => e.role === "Manager")
            .length,
          activeEmployees: data.filter((e: Employee) => e.status === "Active")
            .length,
        });
      } catch (err) {
        toast.toast({
          title: "Error loading employees",
          description: "Failed to fetch employee data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return {
    session,
    status,
    isLoading,
    employees,
    setEmployees,
    stats,
    isAdmin,
    isManager,
    router,
    toast,
  };
}
