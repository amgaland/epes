"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { req } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Project {
  id: string;
  name: string;
}

interface FormErrors {
  project_id?: string;
  title?: string;
  status?: string;
  deadline?: string;
  completed_at?: string;
}

interface TaskPayload {
  project_id: string;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed";
  assigned_to_id?: string;
  deadline?: string;
  completed_at?: string;
}

const TaskEditPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    assigned_to_id: "unassigned",
    status: "Pending" as "Pending" | "In Progress" | "Completed",
    deadline: "",
    completed_at: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      if (!taskId) {
        setErrors({ title: "Task ID is missing." });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch task details
        const taskResponse = await req.GET(
          `/protected/tasks/${taskId}`,
          session.user.token
        );

        // Fetch projects
        const projectResponse = await req.GET(
          "/protected/projects",
          session.user.token
        );
        const mappedProjects: Project[] = projectResponse.map((p: any) => ({
          id: p.id,
          name: p.name,
        }));
        setProjects(mappedProjects);

        // Fetch users
        const userResponse = await req.GET(`/admin/users`, session.user.token);
        const mappedUsers: User[] = userResponse.map((u: any) => ({
          id: u.id,
          first_name: u.first_name || "",
          last_name: u.last_name || "",
        }));
        setUsers(mappedUsers);

        // Pre-populate form with task data
        setFormData({
          project_id: taskResponse.project_id || "",
          title: taskResponse.title || "",
          description: taskResponse.description || "",
          assigned_to_id: taskResponse.assigned_to_id || "unassigned",
          status: taskResponse.status || "Pending",
          deadline: taskResponse.deadline
            ? new Date(taskResponse.deadline).toISOString().split("T")[0]
            : "",
          completed_at: taskResponse.completed_at
            ? new Date(taskResponse.completed_at).toISOString().split("T")[0]
            : "",
        });
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        setErrors({
          title: "Failed to load task or related data: " + error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, router, taskId]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.project_id) {
      newErrors.project_id = "Project is required";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!["Pending", "In Progress", "Completed"].includes(formData.status)) {
      newErrors.status = "Status must be Pending, In Progress, or Completed";
    }
    if (formData.deadline) {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }
    if (formData.status === "Completed" && !formData.completed_at) {
      newErrors.completed_at = "Completed date is required for completed tasks";
    }
    if (formData.completed_at) {
      const completedDate = new Date(formData.completed_at);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (completedDate > tomorrow) {
        newErrors.completed_at = "Completed date cannot be in the future";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!session?.user?.token) {
      alert("Authentication token missing. Please log in again.");
      router.push("/login");
      return;
    }

    const payload: TaskPayload = {
      project_id: formData.project_id,
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      assigned_to_id:
        formData.assigned_to_id && formData.assigned_to_id !== "unassigned"
          ? formData.assigned_to_id
          : undefined,
      deadline: formData.deadline
        ? new Date(formData.deadline + "T12:00:00Z").toISOString()
        : undefined,
      completed_at:
        formData.completed_at && formData.status === "Completed"
          ? new Date(formData.completed_at + "T12:00:00Z").toISOString()
          : undefined,
    };

    // Clean undefined fields
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );

    console.log("Submitting payload:", JSON.stringify(cleanPayload, null, 2));

    try {
      setIsSubmitting(true);
      await req.PUT(
        `/protected/tasks/${taskId}`,
        session.user.token,
        cleanPayload
      );
      alert("Task updated successfully!");
      router.push(`/task/view/${taskId}`);
    } catch (error: any) {
      console.error("Failed to update task:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        request: error.request,
        config: error.config,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        error.message ||
        "Unknown error";
      setErrors({ title: `Failed to update task: ${errorMessage}` });
    } finally {
      setIsSubmitting(false);
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

  if (!isAdmin && !isManager) {
    alert("You do not have permission to edit tasks.");
    router.push(`/task/view/${taskId}`);
    return null;
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
                    onClick={() => router.push(`/task/view/${taskId}`)}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to Task</TooltipContent>
              </Tooltip>
              <h1 className="text-2xl font-semibold tracking-tight">
                Edit Task
              </h1>
            </div>
          </header>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="project_id">Project</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Select
                          name="project_id"
                          value={formData.project_id}
                          onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              project_id: value,
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              project_id: undefined,
                            }));
                          }}
                        >
                          <SelectTrigger
                            id="project_id"
                            className={
                              errors.project_id ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the project for this task
                      </TooltipContent>
                    </Tooltip>
                    {errors.project_id && (
                      <p className="text-sm text-red-500">
                        {errors.project_id}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter task title"
                          className={errors.title ? "border-red-500" : ""}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        Enter a brief title for the task
                      </TooltipContent>
                    </Tooltip>
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter task description (optional)"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        Provide details about the task
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="assigned_to_id">Assigned To</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Select
                          name="assigned_to_id"
                          value={formData.assigned_to_id}
                          onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              assigned_to_id: value,
                            }));
                          }}
                        >
                          <SelectTrigger id="assigned_to_id">
                            <SelectValue placeholder="Select a user or leave unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name || user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TooltipTrigger>
                      <TooltipContent>
                        Assign the task to a user or leave unassigned
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Select
                          name="status"
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: value as
                                | "Pending"
                                | "In Progress"
                                | "Completed",
                            }))
                          }
                        >
                          <SelectTrigger
                            id="status"
                            className={errors.status ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the current status of the task
                      </TooltipContent>
                    </Tooltip>
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="deadline"
                          name="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          className={errors.deadline ? "border-red-500" : ""}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the deadline (optional)
                      </TooltipContent>
                    </Tooltip>
                    {errors.deadline && (
                      <p className="text-sm text-red-500">{errors.deadline}</p>
                    )}
                  </div>

                  {formData.status === "Completed" && (
                    <div className="grid gap-2">
                      <Label htmlFor="completed_at">Completed At</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            id="completed_at"
                            name="completed_at"
                            type="date"
                            value={formData.completed_at}
                            onChange={handleInputChange}
                            className={
                              errors.completed_at ? "border-red-500" : ""
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          Select the date the task was completed
                        </TooltipContent>
                      </Tooltip>
                      {errors.completed_at && (
                        <p className="text-sm text-red-500">
                          {errors.completed_at}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/task/view/${taskId}`)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TaskEditPage;
