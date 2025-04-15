// src/app/protected/task/components/TaskGrid.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Task } from "../types";

interface TaskGridProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function TaskGrid({ tasks, onTaskClick }: TaskGridProps) {
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TooltipProvider key={task.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => onTaskClick(task.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
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
                      <p className="text-sm text-muted-foreground">
                        Due: {task.dueDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Assigned:{" "}
                        {task.assignedTo
                          ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`.trim()
                          : "Unassigned"}
                      </p>
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
                      <Progress value={getProgressValue(task.status)} />
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
        <p className="text-center col-span-full">No tasks found.</p>
      )}
    </div>
  );
}
