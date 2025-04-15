// src/app/protected/dashboard/employee/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { EmployeeDashboard } from "../components/EmployeeDashboard";
import { fetchDashboardData } from "../services/dashboardService";
import { DashboardData } from "../types";

export default function EmployeeDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({ kpis: [], stats: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token || !session?.user?.id) {
        toast({
          title: "Authentication Error",
          description: "Authentication token or user ID missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        const dashboardData = await fetchDashboardData(
          "EMPLOYEE",
          session.user.token,
          {
            userId: session.user.id,
          }
        );
        setData(dashboardData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load dashboard: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [session, status, toast]);

  return <EmployeeDashboard data={data} isLoading={isLoading} />;
}
