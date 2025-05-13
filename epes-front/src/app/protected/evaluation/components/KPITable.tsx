// src/app/protected/kpi/components/KPITable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { EmployeeKPI } from "../types";

interface KPITableProps {
  kpis: EmployeeKPI[];
  onSort: (field: keyof EmployeeKPI) => void;
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export function KPITable({
  kpis,
  onSort,
  onClick,
  onEdit,
  onDelete,
}: KPITableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("employeeName")}
          >
            Employee Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("taskCompletionRate")}
          >
            Task Completion (%) <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("tasksCompleted")}
          >
            Tasks Completed <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("projectContribution")}
          >
            Project Contribution (%){" "}
            <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("projectsAssigned")}
          >
            Projects Assigned <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("performanceScore")}
          >
            Performance Score <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("status")}
          >
            Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {kpis.length > 0 ? (
          kpis.map((kpi) => (
            <TableRow
              key={kpi.employeeId}
              onClick={() => onClick(kpi.employeeId)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell className="font-medium">{kpi.employeeName}</TableCell>
              <TableCell>{kpi.taskCompletionRate}%</TableCell>
              <TableCell>{kpi.tasksCompleted}</TableCell>
              <TableCell>{kpi.projectContribution}%</TableCell>
              <TableCell>{kpi.projectsAssigned}</TableCell>
              <TableCell>{kpi.performanceScore}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(kpi.employeeId);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(kpi.employeeId);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              No employee KPIs found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
