"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KPIStat } from "../components/kpi/KPIStat"; // You can make this reusable
import { fetchEmployeeKPIs } from "../../kpi/services/kpiService";
import { EmployeeKPI } from "../../kpi/types";

const EmployeeDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [kpi, setKPI] = useState<EmployeeKPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKPI = async () => {
      if (!session?.user?.token || !session?.user?.id) {
        toast({
          title: "Unauthorized",
          description: "Please login again.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        const result = await fetchEmployeeKPIs(session.user.id);
        setKPI(result[0]);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load your KPI data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) loadKPI();
  }, [session, router, toast]);

  if (status === "loading" || loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-[200px] mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-center text-muted-foreground">
          No KPI data available.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your KPI Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <KPIStat label="Tasks Completed" value={kpi.tasksCompleted} />
          <KPIStat label="Tasks Assigned" value={kpi.tasksAssigned} />
          <KPIStat
            label="Task Completion Rate"
            value={`${kpi.taskCompletionRate}%`}
          />
          <KPIStat label="Projects Assigned" value={kpi.projectsAssigned} />
          <KPIStat
            label="Project Contribution"
            value={`${kpi.projectContribution}%`}
          />
          <KPIStat
            label="Performance Score"
            value={`${kpi.performanceScore}`}
          />
          <KPIStat label="Status" value={kpi.status} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
