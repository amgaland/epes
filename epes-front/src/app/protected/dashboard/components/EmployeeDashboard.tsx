// src/app/protected/dashboard/components/EmployeeDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardData } from "../types";

interface EmployeeDashboardProps {
  data: DashboardData;
  isLoading: boolean;
}

export function EmployeeDashboard({ data, isLoading }: EmployeeDashboardProps) {
  const kpi = data.kpis[0];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Performance</h1>

      <Card>
        <CardHeader>
          <CardTitle>{kpi.employeeName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Performance Score</p>
            <Progress value={kpi.performanceScore} />
            <p className="text-lg font-bold">{kpi.performanceScore}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              variant={
                kpi.status === "Excellent"
                  ? "secondary"
                  : kpi.status === "Good"
                    ? "default"
                    : "outline"
              }
            >
              {kpi.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Task Completion</p>
            <p className="text-lg">{kpi.taskCompletionRate}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tasks</p>
            <p className="text-lg">
              {kpi.tasksCompleted}/{kpi.tasksAssigned}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Project Contribution
            </p>
            <p className="text-lg">{kpi.projectContribution}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Projects Assigned</p>
            <p className="text-lg">{kpi.projectsAssigned}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
