// src/app/protected/kpi/components/KPIGrid.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { EmployeeKPI } from "../types";

interface KPIGridProps {
  kpis: EmployeeKPI[];
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  kpis,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi) => (
        <Card
          key={kpi.employee_id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onClick(kpi.employee_id)}
        >
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{kpi.employee_name}</h3>
            <p className="text-sm text-muted-foreground">
              Status: {kpi.status}
            </p>
            <p className="text-sm">
              Tasks: {kpi.tasks_completed}/{kpi.tasks_assigned}
            </p>
            <p className="text-sm">Projects: {kpi.projects_assigned}</p>
            <p className="text-sm">
              Score:{" "}
              {typeof kpi.performance_score === "number"
                ? kpi.performance_score.toFixed(1)
                : "N/A"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(kpi.employee_id);
              }}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(kpi.employee_id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
