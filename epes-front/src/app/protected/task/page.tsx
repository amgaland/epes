// app/tasks/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Users, Calendar } from "lucide-react";

interface TaskStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

interface Task {
  id: string;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
  assignedTo: string;
  priority: "Low" | "Medium" | "High";
}

const mockStats: TaskStat[] = [
  { title: "Pending Tasks", value: 8, icon: Clock },
  { title: "Completed Tasks", value: 15, icon: CheckCircle },
  { title: "Assigned Team", value: 10, icon: Users },
  { title: "Due This Week", value: 5, icon: Calendar },
];

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review project proposal",
    status: "Pending",
    dueDate: "2025-03-28",
    assignedTo: "John Doe",
    priority: "High",
  },
  {
    id: "2",
    title: "Update documentation",
    status: "In Progress",
    dueDate: "2025-03-26",
    assignedTo: "Jane Smith",
    priority: "Medium",
  },
  {
    id: "3",
    title: "Test new feature",
    status: "Completed",
    dueDate: "2025-03-25",
    assignedTo: "Mike Johnson",
    priority: "Low",
  },
  {
    id: "4",
    title: "Team meeting prep",
    status: "Pending",
    dueDate: "2025-03-27",
    assignedTo: "Sarah Lee",
    priority: "Medium",
  },
];

const TasksPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle loading and auth states
  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-[100px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[60px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  // Normalize roles
  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");
  const isEmployee = !isAdmin && !isManager && roles.length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Tasks</h1>

          {/* Task Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {isLoading
              ? mockStats.map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-[60px]" />
                    </CardContent>
                  </Card>
                ))
              : mockStats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Task Actions */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {(isAdmin || isManager) && (
                  <Button
                    onClick={() => router.push("/tasks/new")}
                    disabled={isLoading}
                  >
                    Assign New Task
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/tasks/pending")}
                  disabled={isLoading}
                  variant="outline"
                >
                  View Pending Tasks
                </Button>
                <Button
                  onClick={() => router.push("/tasks/all")}
                  disabled={isLoading}
                  variant="secondary"
                >
                  View All Tasks
                </Button>
                {isEmployee && (
                  <Button
                    onClick={() => router.push("/tasks/my-tasks")}
                    disabled={isLoading}
                    variant="default"
                  >
                    My Tasks
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Total Tasks: {mockTasks.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In Progress:{" "}
                      {
                        mockTasks.filter((t) => t.status === "In Progress")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed:{" "}
                      {mockTasks.filter((t) => t.status === "Completed").length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
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
                        <TableCell>{task.assignedTo}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TasksPage;
