// src/app/protected/dashboard/manager/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { ManagerDashboard } from "../components/ManagerDashboard";
import { fetchDashboardData } from "../services/dashboardService";
import { DashboardData } from "../types";

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({ kpis: [], stats: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token or team ID missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        const dashboardData = await fetchDashboardData(
          "MANAGER",
          session.user.token
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

  return <ManagerDashboard data={data} isLoading={isLoading} />;
}
