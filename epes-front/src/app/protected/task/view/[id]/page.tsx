"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { req } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Clock, Users, Calendar, Folder } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
  assignedTo: User | null;
  priority: "Low" | "Medium" | "High";
  project: Project | null;
}

const TaskViewPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!session?.user?.token) {
        console.error("No token available in session:", session);
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      if (!taskId) {
        setError("Task ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch task details
        const taskResponse = await req.GET(
          `/protected/tasks?id=${taskId}`,
          session.user.token
        );

        // Fetch assigned user details if assigned_to exists
        let assignedTo: User | null = null;
        if (taskResponse.assigned_to) {
          try {
            const userResponse = await req.GET(
              `/admin/users?id=${encodeURIComponent(taskResponse.assigned_to)}`,
              session.user.token
            );
            assignedTo = {
              user_id: taskResponse.assigned_to,
              first_name: userResponse.first_name || "Unknown",
              last_name: userResponse.last_name || "User",
            };
          } catch (userError) {
            console.error(
              `Failed to fetch user ${taskResponse.assigned_to}:`,
              userError
            );
            assignedTo = {
              user_id: taskResponse.assigned_to,
              first_name: "Unknown",
              last_name: "User",
            };
          }
        }

        // Fetch project details if project_id exists
        let project: Project | null = null;
        if (taskResponse.project_id) {
          try {
            const projectResponse = await req.GET(
              `/protected/projects/${taskResponse.project_id}`,
              session.user.token
            );
            project = {
              id: taskResponse.project_id,
              name: projectResponse.name || "Unknown Project",
            };
          } catch (projectError) {
            console.error(
              `Failed to fetch project ${taskResponse.project_id}:`,
              projectError
            );
            project = { id: taskResponse.project_id, name: "Unknown Project" };
          }
        }

        const mappedTask: Task = {
          id: taskResponse.id,
          title: taskResponse.title,
          description: taskResponse.description || null,
          status: taskResponse.status,
          dueDate: taskResponse.due_date
            ? new Date(taskResponse.due_date).toISOString().split("T")[0]
            : "N/A",
          assignedTo,
          priority: taskResponse.priority || "Low",
          project,
        };

        setTask(mappedTask);
      } catch (error: any) {
        console.error("Failed to fetch task:", error);
        setError("Failed to load task: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTask();
    }
  }, [session, router, taskId]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <Skeleton className="h-10 w-[250px] mb-6" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/protected/task")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              Task Details
            </h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/protected/task")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              Task Details
            </h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p>No task found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/protected/task")}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to Tasks</TooltipContent>
              </Tooltip>
              <h1 className="text-2xl font-semibold tracking-tight">
                {task.title}
              </h1>
            </div>
            {(isAdmin || isManager) && (
              <Button
                onClick={() => router.push(`/protected/task/edit/${task.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </Button>
            )}
          </header>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
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
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Priority</p>
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
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <Progress
                      value={getProgressValue(task.status)}
                      className="w-[60%]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> Due Date
                      </p>
                      <p>{task.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Users className="mr-2 h-4 w-4" /> Assigned To
                      </p>
                      <p>
                        {task.assignedTo
                          ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`
                          : "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Folder className="mr-2 h-4 w-4" /> Project
                    </p>
                    <p>
                      {task.project ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() =>
                            router.push(
                              `/protected/project/view/${task.project!.id}`
                            )
                          }
                        >
                          {task.project.name}
                        </Button>
                      ) : (
                        "No project assigned"
                      )}
                    </p>
                  </div>

                  {task.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="whitespace-pre-wrap">{task.description}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TaskViewPage;
