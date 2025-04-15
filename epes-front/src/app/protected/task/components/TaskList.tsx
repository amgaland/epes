// src/app/protected/task/components/TaskList.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Task } from "../types";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const getProgressValue = (status: string) => {
    switch (status) {
      case "Completed":
        return 100;
      case "In Progress":
        return 50;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TooltipProvider key={task.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => onTaskClick(task.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {task.dueDate} | Assigned:{" "}
                        {task.assignedTo
                          ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`.trim()
                          : "Unassigned"}
                      </p>
                      <Progress
                        value={getProgressValue(task.status)}
                        className="w-[200px]"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
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
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Task: {task.title}</p>
                <p>
                  Assigned:{" "}
                  {task.assignedTo
                    ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`.trim()
                    : "Unassigned"}
                </p>
                <p>Priority: {task.priority}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      ) : (
        <p className="text-center">No tasks found.</p>
      )}
    </div>
  );
}
