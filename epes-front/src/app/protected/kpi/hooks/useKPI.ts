// src/app/protected/kpi/hooks/useKPI.ts
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEmployeeKPIs, deleteKPI } from "../services/kpiService";
import { EmployeeKPI, KPIStat } from "../types";
import { BarChart, CheckCircle, Clock, Users } from "lucide-react";

/**
 * Custom hook to manage KPI data, including fetching, metrics calculation, and deletion.
 * @returns Object containing KPIs, stats, loading state, and delete function.
 */
export const useKPI = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [kpis, setKPIs] = useState<EmployeeKPI[]>([]);

  // Fetch KPIs using React Query
  const { isLoading, error } = useQuery<EmployeeKPI[], Error>({
    queryKey: ["kpis", session?.user?.token],
    queryFn: async () => {
      if (!session?.user?.token)
        throw new Error("Authentication token missing");
      const data = await fetchEmployeeKPIs(session.user.token);
      setKPIs(data);
      return data;
    },
    enabled: !!session?.user?.token,
  });

  // Handle errors from useQuery
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: `Failed to load KPIs: ${error.message}`,
        variant: "destructive",
      });
      setKPIs([]);
    }
  }, [error, toast]);

  // Delete KPI mutation
  const deleteKPIMutation = useMutation({
    mutationFn: (employeeId: string) => {
      if (!session?.user?.token)
        throw new Error("Authentication token missing");
      return deleteKPI(employeeId, session.user.token);
    },
    onSuccess: (_, employeeId) => {
      setKPIs((prev) => prev.filter((kpi) => kpi.employeeId !== employeeId));
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      toast({
        title: "Success",
        description: "KPI record deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete KPI: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Calculate KPI metrics
  const calculateKPIMetrics = useCallback((kpiData: EmployeeKPI[]) => {
    const totalEmployees = kpiData.length;
    const metrics = kpiData.reduce(
      (acc, kpi) => ({
        excellent: acc.excellent + (kpi.status === "Excellent" ? 1 : 0),
        good: acc.good + (kpi.status === "Good" ? 1 : 0),
        needsImprovement:
          acc.needsImprovement + (kpi.status === "Needs Improvement" ? 1 : 0),
        totalScore: acc.totalScore + kpi.performanceScore,
      }),
      { excellent: 0, good: 0, needsImprovement: 0, totalScore: 0 }
    );

    const avgPerformanceScore = totalEmployees
      ? Math.round(metrics.totalScore / totalEmployees)
      : 0;

    return {
      stats: [
        {
          title: "Excellent Performers",
          value: metrics.excellent,
          icon: CheckCircle,
        },
        { title: "Good Performers", value: metrics.good, icon: Users },
        {
          title: "Needs Improvement",
          value: metrics.needsImprovement,
          icon: Clock,
        },
        {
          title: "Avg Performance Score",
          value: avgPerformanceScore,
          icon: BarChart,
        },
      ],
      metrics: {
        totalEmployees,
        excellentPerformers: metrics.excellent,
        avgPerformanceScore,
      },
    };
  }, []);

  const kpiMetrics = useMemo(
    () => calculateKPIMetrics(kpis),
    [kpis, calculateKPIMetrics]
  );

  return {
    kpis,
    stats: kpiMetrics.stats,
    isLoading,
    deleteKPI: deleteKPIMutation.mutate,
  };
};
