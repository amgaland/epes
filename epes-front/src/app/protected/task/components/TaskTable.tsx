// src/app/protected/task/components/TaskTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Task } from "../types";

interface TaskTableProps {
  tasks: Task[];
  onSort: (field: keyof Task) => void;
  onTaskClick: (taskId: string) => void;
}

export function TaskTable({ tasks, onSort, onTaskClick }: TaskTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => onSort("title")}>
            Task Title <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("status")}
          >
            Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("dueDate")}
          >
            Due Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("assignedTo")}
          >
            Assigned To <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("priority")}
          >
            Priority <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TableRow
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    task.status === "Completed"
                      ? "secondary"
                      : task.status === "In Progress"
                        ? "default"
                        : "outline"
                  }
                >
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>{task.dueDate}</TableCell>
              <TableCell>
                {task.assignedTo
                  ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`.trim()
                  : "Unassigned"}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority}
                </span>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No tasks found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
