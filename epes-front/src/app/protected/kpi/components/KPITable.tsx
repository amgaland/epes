// src/app/protected/kpi/components/KPITable.tsx
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { EmployeeKPI } from "../types";

interface KPITableProps {
  kpis: EmployeeKPI[];
  onSort: (field: keyof EmployeeKPI) => void;
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export const KPITable: React.FC<KPITableProps> = ({
  kpis,
  onSort,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell
            onClick={() => onSort("employee_name")}
            className="cursor-pointer"
          >
            Employee
          </TableCell>
          <TableCell
            onClick={() => onSort("status")}
            className="cursor-pointer"
          >
            Status
          </TableCell>
          <TableCell
            onClick={() => onSort("tasks_completed")}
            className="cursor-pointer"
          >
            Tasks Completed
          </TableCell>
          <TableCell
            onClick={() => onSort("projects_assigned")}
            className="cursor-pointer"
          >
            Projects Assigned
          </TableCell>
          <TableCell
            onClick={() => onSort("performance_score")}
            className="cursor-pointer"
          >
            Performance Score
          </TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {kpis.map((kpi) => (
          <TableRow
            key={kpi.employee_id}
            onClick={() => onClick(kpi.employee_id)}
          >
            <TableCell>{kpi.employee_name}</TableCell>
            <TableCell>{kpi.status}</TableCell>
            <TableCell>
              {kpi.tasks_completed}/{kpi.tasks_assigned}
            </TableCell>
            <TableCell>{kpi.projects_assigned}</TableCell>
            <TableCell>
              {typeof kpi.performance_score === "number"
                ? kpi.performance_score.toFixed(1)
                : "N/A"}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(kpi.employee_id);
                }}
                className="mr-2"
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
