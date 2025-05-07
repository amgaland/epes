// src/app/protected/task/hooks/useTasks.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { req } from "@/app/api";
import { Task, TaskResponse, TaskStat } from "../types";
import { Clock, Users, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function useTasks() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStat[]>([]);
  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const isEmployee = !isAdmin && !isManager && roles.length > 0;

  const fetchTasks = async () => {
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
      const response: TaskResponse[] = await req.GET(
        "/protected/tasks",
        session.user.token
      );
      const mappedTasks: Task[] = response.map((t) => {
        const assignedTo = t.assigned_to
          ? {
              id: t.assigned_to.id,
              first_name: t.assigned_to.first_name || "Unassigned",
              last_name: t.assigned_to.last_name || "",
            }
          : null;
        let formattedDueDate = "N/A";
        if (t.deadline) {
          const parsedDate = new Date(t.deadline);
          if (!isNaN(parsedDate.getTime())) {
            formattedDueDate = parsedDate.toISOString().split("T")[0];
          }
        }
        return {
          id: t.id,
          title: t.title,
          description: t.description || null,
          status: t.status,
          dueDate: formattedDueDate,
          assignedTo,
          priority: t.priority,
          project: t.project_id ? { id: t.project_id, name: "Unknown" } : null,
        };
      });

      setTasks(mappedTasks);

      const pendingTasks = mappedTasks.filter(
        (t) => t.status === "Pending"
      ).length;
      const inProgressTasks = mappedTasks.filter(
        (t) => t.status === "In Progress"
      ).length;
      const completedTasks = mappedTasks.filter(
        (t) => t.status === "Completed"
      ).length;
      const dueThisWeek = mappedTasks.filter(
        (t) =>
          t.status !== "Completed" &&
          t.dueDate !== "N/A" &&
          new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length;

      setStats([
        { title: "Pending Tasks", value: pendingTasks, icon: Clock },
        { title: "In Progress Tasks", value: inProgressTasks, icon: Users },
        { title: "Completed Tasks", value: completedTasks, icon: CheckCircle },
        { title: "Due This Week", value: dueThisWeek, icon: Calendar },
      ]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tasks: " + error.message,
      });
      setTasks([]);
      setStats([
        { title: "Pending Tasks", value: 0, icon: Clock },
        { title: "In Progress Tasks", value: 0, icon: Users },
        { title: "Completed Tasks", value: 0, icon: CheckCircle },
        { title: "Due This Week", value: 0, icon: Calendar },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  return {
    session,
    status,
    isLoading,
    tasks,
    stats,
    isAdmin,
    isManager,
    isEmployee,
    router,
    refetchTasks: fetchTasks,
  };
}
