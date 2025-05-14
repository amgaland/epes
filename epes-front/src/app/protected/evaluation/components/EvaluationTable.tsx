import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Evaluation } from "../types";
import { ArrowUpDown } from "lucide-react";

interface EvaluationTableProps {
  evaluations: Evaluation[];
  handleSort: (field: keyof Evaluation) => void;
  handleEvaluationClick: (evaluationId: string) => void;
  sortField: keyof Evaluation | null;
  sortDirection: "asc" | "desc";
}

export function EvaluationTable({
  evaluations,
  handleSort,
  handleEvaluationClick,
  sortField,
  sortDirection,
}: EvaluationTableProps) {
  const getSortIndicator = (field: keyof Evaluation) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("id")}
          >
            ID {getSortIndicator("id")}
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("employee_id")}
          >
            Employee ID {getSortIndicator("employee_id")}
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("project_id")}
          >
            Project ID {getSortIndicator("project_id")}
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("task_id")}
          >
            Task ID {getSortIndicator("task_id")}
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("type")}
          >
            Type {getSortIndicator("type")}
          </TableHead>
          <TableHead>Value</TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("date")}
          >
            Date {getSortIndicator("date")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7}>No evaluations found.</TableCell>
          </TableRow>
        ) : (
          evaluations.map((evaluation) => (
            <TableRow
              key={evaluation.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleEvaluationClick(evaluation.id)}
            >
              <TableCell>{evaluation.id}</TableCell>
              <TableCell>{evaluation.employee_id}</TableCell>
              <TableCell>{evaluation.project_id || "-"}</TableCell>
              <TableCell>{evaluation.task_id || "-"}</TableCell>
              <TableCell>{evaluation.type}</TableCell>
              <TableCell>
                {typeof evaluation.value === "string"
                  ? evaluation.value.slice(0, 50)
                  : evaluation.value}
              </TableCell>
              <TableCell>{evaluation.date}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
