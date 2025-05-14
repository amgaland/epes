// src/app/protected/kpi/hooks/useKPI.ts
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllKPIs, deleteKPI } from "../services/kpiService";
import { EmployeeKPI, KPIStat } from "../types";
import { BarChart, CheckCircle, Clock, Users } from "lucide-react";

export const useKPI = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [kpis, setKPIs] = useState<EmployeeKPI[]>([]);

  const { isLoading, error } = useQuery<EmployeeKPI[], Error>({
    queryKey: ["kpis", session?.user?.token],
    queryFn: async () => {
      if (!session?.user?.token) {
        throw new Error("Authentication token missing");
      }
      const data = await fetchAllKPIs(session.user.token);
      const validKPIs = data.filter(
        (kpi): kpi is EmployeeKPI =>
          kpi.employee_id !== undefined &&
          kpi.employee_name !== undefined &&
          kpi.task_completion_rate !== undefined &&
          kpi.tasks_completed !== undefined &&
          kpi.tasks_assigned !== undefined &&
          kpi.project_contribution !== undefined &&
          kpi.projects_assigned !== undefined &&
          kpi.performance_score !== undefined &&
          kpi.status !== undefined
      );
      setKPIs(validKPIs);
      if (validKPIs.length < data.length) {
        console.warn(
          `Filtered out ${data.length - validKPIs.length} invalid KPIs`
        );
        toast({
          title: "Warning",
          description: `${data.length - validKPIs.length} KPIs were invalid and excluded.`,
          variant: "default",
        });
      }
      return validKPIs;
    },
    enabled: Boolean(session?.user?.token),
  });

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

  const deleteKPIMutation = useMutation({
    mutationFn: (employeeId: string) => {
      if (!session?.user?.token) {
        throw new Error("Authentication token missing");
      }
      return deleteKPI(employeeId, session.user.token);
    },
    onSuccess: (_, employeeId) => {
      setKPIs((prev) => prev.filter((kpi) => kpi.employee_id !== employeeId));
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

  const calculateKPIMetrics = useCallback((kpiData: EmployeeKPI[]) => {
    const totalEmployees = kpiData.length;
    const metrics = kpiData.reduce(
      (acc, kpi) => ({
        excellent: acc.excellent + (kpi.status === "Excellent" ? 1 : 0),
        good: acc.good + (kpi.status === "Good" ? 1 : 0),
        needsImprovement:
          acc.needsImprovement + (kpi.status === "Needs Improvement" ? 1 : 0),
        totalScore: acc.totalScore + (kpi.performance_score || 0),
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
