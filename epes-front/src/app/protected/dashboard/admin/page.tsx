// src/app/protected/dashboard/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { AdminDashboard } from "../components/AdminDashboard";
import { fetchDashboardData } from "../services/dashboardService";
import { DashboardData } from "../types";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({ kpis: [], stats: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        const dashboardData = await fetchDashboardData(
          "ADMIN",
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

  return <AdminDashboard data={data} isLoading={isLoading} />;
}
