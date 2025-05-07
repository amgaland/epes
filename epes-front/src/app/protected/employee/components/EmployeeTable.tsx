import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Employee } from "../types";
import { cn } from "@/lib/utils";

export const EmployeeTable = ({
  employees,
  handleSort,
  handleEmployeeClick,
  handleFeedback,
  isAdmin,
  isManager,
}: {
  employees: Employee[];
  handleSort: (field: keyof Employee) => void;
  handleEmployeeClick: (id: string) => void;
  handleFeedback: (id: string) => void;
  isAdmin: boolean;
  isManager: boolean;
}) => (
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b">
        <th className="p-4 text-left" onClick={() => handleSort("firstName")}>
          Name
        </th>
        <th className="p-4 text-left" onClick={() => handleSort("role")}>
          Role
        </th>
        <th className="p-4 text-left" onClick={() => handleSort("status")}>
          Status
        </th>
        <th className="p-4 text-left">Projects</th>
        <th className="p-4 text-left">Tasks</th>
        {(isAdmin || isManager) && <th className="p-4 text-left">Feedback</th>}
      </tr>
    </thead>
    <tbody>
      {employees.map((employee) => (
        <tr
          key={employee.id}
          onClick={() => handleEmployeeClick(employee.id)}
          className={cn("border-b cursor-pointer hover:bg-muted")}
        >
          <td className="p-4">{`${employee.firstName} ${employee.lastName}`}</td>
          <td className="p-4">{employee.role}</td>
          <td className="p-4">{employee.status}</td>
          <td className="p-4">
            {employee.projects.map((p) => p.name).join(", ") || "None"}
          </td>
          <td className="p-4">
            {employee.tasks.map((t) => t.title).join(", ") || "None"}
          </td>
          {(isAdmin || isManager) && (
            <td className="p-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(employee.id);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add or view feedback</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);
