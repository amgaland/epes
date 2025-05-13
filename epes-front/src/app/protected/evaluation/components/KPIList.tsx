// src/app/protected/kpi/components/KPIList.tsx
import { Card, CardContent } from "@/components/ui/card";
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

interface KPIListProps {
  kpis: EmployeeKPI[];
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export function KPIList({ kpis, onClick, onEdit, onDelete }: KPIListProps) {
  return (
    <div className="space-y-4">
      {kpis.length > 0 ? (
        kpis.map((kpi) => (
          <TooltipProvider key={kpi.employeeId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => onClick(kpi.employeeId)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">
                        {kpi.employeeName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tasks: {kpi.tasksCompleted}/{kpi.tasksAssigned} |
                        Projects: {kpi.projectsAssigned}
                      </p>
                      <Progress
                        value={kpi.performanceScore}
                        className="w-[200px]"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
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
                      <p className="text-sm font-medium">
                        Score: {kpi.performanceScore}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(kpi.employeeId);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(kpi.employeeId);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
        <p className="text-center">No employee KPIs found.</p>
      )}
    </div>
  );
}
