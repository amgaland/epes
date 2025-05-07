// src/app/protected/dashboard/manager/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { ManagerDashboard } from "../components/ManagerDashboard";
import { fetchDashboardData } from "../services/dashboardService";
import { DashboardData } from "../types";

// Define default dashboard data to avoid undefined states
const DEFAULT_DASHBOARD_DATA: DashboardData = { kpis: [], stats: [] };

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize fetchData to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!session?.user?.token) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to view the dashboard.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const dashboardData = await fetchDashboardData(
        "MANAGER",
        session.user.token
      );
      setData(dashboardData || DEFAULT_DASHBOARD_DATA); // Fallback to default if null
    } catch (error) {
      toast({
        title: "Error Loading Dashboard",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      setData(DEFAULT_DASHBOARD_DATA); // Reset to default on error
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, toast]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setIsLoading(false); // Stop loading if user is not authenticated
    }
  }, [status, fetchData]);

  return <ManagerDashboard data={data} isLoading={isLoading} />;
}
