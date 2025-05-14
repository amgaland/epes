"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { req } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Task, TaskResponse } from "../../types";
import axios from "axios";

export default function TaskViewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updaterName, setUpdaterName] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!session?.user?.token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token missing. Please log in again.",
        });
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

        const taskResponse: TaskResponse = await req.GET(
          `/protected/tasks?id=${taskId}`,
          session.user.token
        );

        let project = null;
        if (taskResponse.project_id) {
          try {
            const projectResponse = await req.GET(
              `/protected/projects?id=${taskResponse.project_id}`,
              session.user.token
            );
            project = {
              id: taskResponse.project_id,
              name: projectResponse.name || "Unnamed Project",
            };
          } catch (projectError: any) {
            project = {
              id: taskResponse.project_id,
              name: "Unnamed Project",
            };
          }
        }

        let formattedDueDate = "N/A";
        if (taskResponse.deadline) {
          const parsedDate = new Date(taskResponse.deadline);
          if (!isNaN(parsedDate.getTime())) {
            formattedDueDate = parsedDate.toISOString().split("T")[0];
          }
        }

        // Fetch updater name
        let updaterName = "No updater specified";
        if (taskResponse.updated_by) {
          try {
            const userResponse = await req.GET(
              `/admin/users?id=${taskResponse.updated_by}`,
              session.user.token
            );
            updaterName =
              `${userResponse.first_name || "Unknown"} ${userResponse.last_name || ""}`.trim();
          } catch (userError: any) {
            console.error("Failed to fetch updater name:", userError);
          }
        }

        const mappedTask: Task = {
          id: taskResponse.id,
          title: taskResponse.title,
          description: taskResponse.description || null,
          status: taskResponse.status,
          dueDate: formattedDueDate,
          assignedTo: taskResponse.assigned_to
            ? {
                id: taskResponse.assigned_to.id,
                first_name: taskResponse.assigned_to.first_name || "Unassigned",
                last_name: taskResponse.assigned_to.last_name || "",
              }
            : null,
          priority: taskResponse.priority || "Low",
          project,
          comment: taskResponse.comment || null,
          updated_by: taskResponse.updated_by || null,
        };

        setTask(mappedTask);
        setUpdaterName(updaterName);
      } catch (error: any) {
        setError(`Failed to load task: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTask();
    }
  }, [session, router, taskId, toast]);

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

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const addComment = async () => {
    if (!session?.user?.token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authentication token missing. Please log in again.",
      });
      router.push("/login");
      return;
    }

    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID missing. Please log in again.",
      });
      router.push("/login");
      return;
    }

    if (!taskId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task ID is missing.",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment cannot be empty",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Minimal payload as per Postman
      const updatePayload = {
        comment: comment,
        updated_by: session.user.id,
      };

      // Log request details
      console.log("Sending PUT request:", {
        url: `http://localhost:8088/protected/tasks/${taskId}`,
        payload: updatePayload,
        token: session.user.token,
      });

      // Use Axios directly
      const response = await axios.put(
        `http://localhost:8088/protected/tasks/${taskId}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Log response
      console.log("PUT response:", response.status, response.data);

      // Check if comment was updated
      if (response.status === 200 && response.data.comment === comment) {
        toast({
          title: "Success",
          description: "Comment added successfully",
        });

        // Clear the comment field
        setComment("");

        // Refresh the task data
        const updatedTaskResponse: TaskResponse = await req.GET(
          `/protected/tasks?id=${taskId}`,
          session.user.token
        );

        // Log GET response
        console.log("GET response:", updatedTaskResponse);

        // Only update if we received valid data
        if (updatedTaskResponse && updatedTaskResponse.id) {
          // Map the API response to our Task interface
          let project = null;
          if (updatedTaskResponse.project_id) {
            try {
              const projectResponse = await req.GET(
                `/protected/projects?id=${updatedTaskResponse.project_id}`,
                session.user.token
              );
              project = {
                id: updatedTaskResponse.project_id,
                name: projectResponse.name || "Unnamed Project",
              };
            } catch (projectError: any) {
              project = {
                id: updatedTaskResponse.project_id,
                name: "Unnamed Project",
              };
            }
          }

          let formattedDueDate = "N/A";
          if (updatedTaskResponse.deadline) {
            const parsedDate = new Date(updatedTaskResponse.deadline);
            if (!isNaN(parsedDate.getTime())) {
              formattedDueDate = parsedDate.toISOString().split("T")[0];
            }
          }

          const refreshedTask: Task = {
            id: updatedTaskResponse.id,
            title: updatedTaskResponse.title,
            description: updatedTaskResponse.description || null,
            status: updatedTaskResponse.status,
            dueDate: formattedDueDate,
            assignedTo: updatedTaskResponse.assigned_to
              ? {
                  id: updatedTaskResponse.assigned_to.id,
                  first_name:
                    updatedTaskResponse.assigned_to.first_name || "Unassigned",
                  last_name: updatedTaskResponse.assigned_to.last_name || "",
                }
              : null,
            priority: updatedTaskResponse.priority || "Low",
            project,
            comment: updatedTaskResponse.comment || null,
            updated_by: updatedTaskResponse.updated_by || null,
          };

          setTask(refreshedTask);
          // updaterName is already set by fetchTask
        } else {
          console.error("Invalid GET response:", updatedTaskResponse);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to refresh task data.",
          });
        }
      } else {
        console.error("Comment not updated in response:", response.data);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update comment.",
        });
      }
    } catch (error: any) {
      console.error("PUT error:", error, error.response?.data);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComment();
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
                          ? `${task.assignedTo.first_name} ${task.assignedTo.last_name}`.trim()
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
                          className="p-0 h-auto font-normal"
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

                  <form onSubmit={handleCommentSubmit}>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-2 h-4 w-4" /> Comment
                      </p>
                      <input
                        className="border rounded-md p-2 w-full"
                        type="text"
                        value={comment}
                        onChange={handleCommentChange}
                        placeholder="Enter your comment"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="default"
                        className="mt-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Current Comment
                      </p>
                      <p>{task.comment || "No comment yet"}</p>
                      <p>{updaterName}</p>
                    </div>
                  </form>

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
}
