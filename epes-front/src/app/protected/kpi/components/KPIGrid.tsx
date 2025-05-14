// src/app/protected/kpi/components/KPIGrid.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2 } from "lucide-react";
import { EmployeeKPI } from "../types";

interface KPIGridProps {
  kpis: EmployeeKPI[];
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export function KPIGrid({ kpis, onClick, onEdit, onDelete }: KPIGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpis.length > 0 ? (
        kpis.map((kpi) => (
          <TooltipProvider key={kpi.employeeId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => onClick(kpi.employeeId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onClick(kpi.employeeId);
                    }
                  }}
                  className="cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${kpi.employeeName}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {kpi.employeeName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
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
                      <p className="text-sm text-muted-foreground">
                        Task Completion: {kpi.taskCompletionRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tasks: {kpi.tasksCompleted}/{kpi.tasksAssigned}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Project Contribution: {kpi.projectContribution}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Projects: {kpi.projectsAssigned}
                      </p>
                      <Progress value={kpi.performanceScore} />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(kpi.employeeId);
                          }}
                          aria-label={`Edit KPI for ${kpi.employeeName}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(kpi.employeeId);
                          }}
                          aria-label={`Delete KPI for ${kpi.employeeName}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Employee: {kpi.employeeName}</p>
                <p>Performance Score: {kpi.performanceScore}</p>
                <p>Tasks Completed: {kpi.tasksCompleted}</p>
                <p>Projects Assigned: {kpi.projectsAssigned}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      ) : (
        <p className="text-center col-span-full">No employee KPIs found.</p>
      )}
    </div>
  );
}
