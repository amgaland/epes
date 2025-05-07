// src/app/protected/task/hooks/useTaskForm.ts
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { req } from "@/app/api";
import { TaskForm, FormErrors, User, Project, TaskPayload } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useTaskForm(taskId?: string) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<TaskForm>({
    project_id: "",
    title: "",
    description: "",
    assigned_to_id: "unassigned",
    status: "Pending",
    deadline: "",
    completed_at: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchData = useCallback(async () => {
    if (!session?.user?.token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authentication token missing. Please log in again.",
      });
      router.push("/auth/signin");
      return;
    }

    try {
      setIsLoading(true);

      const projectResponse = await req.GET(
        "/protected/projects",
        session.user.token
      );
      const mappedProjects: Project[] = projectResponse.map((p: any) => ({
        id: p.id,
        name: p.name,
      }));
      setProjects(mappedProjects);

      const userResponse = await req.GET("/admin/users", session.user.token);
      const mappedUsers: User[] = userResponse.map((u: any) => ({
        id: u.id,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
      }));
      setUsers(mappedUsers);

      if (taskId) {
        const taskResponse = await req.GET(
          `/protected/tasks?id=${taskId}`,
          session.user.token
        );
        setFormData({
          project_id: taskResponse.project_id || "",
          title: taskResponse.title,
          description: taskResponse.description || "",
          assigned_to_id: taskResponse.assigned_to_id || "unassigned",
          status: taskResponse.status,
          deadline: taskResponse.deadline
            ? new Date(taskResponse.deadline).toISOString().split("T")[0]
            : "",
          completed_at: taskResponse.completed_at
            ? new Date(taskResponse.completed_at).toISOString().split("T")[0]
            : "",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data: " + error.message,
      });
      setProjects([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, taskId, router, toast]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    if (!formData.project_id) newErrors.project_id = "Project is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
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
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      if (!session?.user?.token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token missing. Please log in again.",
        });
        router.push("/auth/signin");
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

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      );

      try {
        setIsSubmitting(true);
        if (taskId) {
          await req.PUT(
            `/protected/tasks/${taskId}`,
            session.user.token,
            cleanPayload
          );
          toast({
            title: "Success",
            description: "Task updated successfully",
          });
        } else {
          await req.POST("/protected/tasks", session.user.token, cleanPayload);
          toast({
            title: "Success",
            description: "Task created successfully",
          });
        }
        router.push("/protected/task");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to ${taskId ? "update" : "create"} task: ${
            error.message
          }`,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, session, taskId, router, toast, validateForm]
  );

  const handleDelete = useCallback(async () => {
    if (!taskId || !session?.user?.token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authentication token missing or invalid task ID.",
      });
      router.push("/auth/signin");
      return;
    }

    try {
      setIsSubmitting(true);
      await req.DELETE(`/protected/tasks/${taskId}`, session.user.token);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      router.push("/protected/task");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task: " + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [taskId, session, router, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return {
    session,
    status,
    isLoading,
    isSubmitting,
    users,
    projects,
    formData,
    errors,
    setFormData,
    setErrors,
    handleSubmit,
    handleDelete,
    handleInputChange,
  };
}
