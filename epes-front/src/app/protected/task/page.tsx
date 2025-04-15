"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { req } from "@/app/api";
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
import {
  Clock,
  CheckCircle,
  Users,
  Calendar,
  Search,
  CirclePlus,
  LayoutGrid,
  List,
  Table as TableIcon,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface TaskStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

interface TaskResponse {
  id: string;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  due_date: string | null;
  assigned_to: string | null;
  priority: "Low" | "Medium" | "High";
}

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface Task {
  id: string;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
  assignedTo: User;
  priority: "Low" | "Medium" | "High";
}

const TasksPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStat[]>([]);
  const [sortField, setSortField] = useState<keyof Task | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Pending" | "In Progress" | "Completed"
  >("All");

  useEffect(() => {
    const fetchTasksAndUsers = async () => {
      if (!session?.user?.token) {
        console.error("No token available in session:", session);
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);

        // Fetch tasks
        const response: TaskResponse[] = await req.GET(
          "/protected/tasks",
          session.user.token
        );

        // Extract unique user IDs, ensuring they are strings
        const taskUserIds = response
          .map((t) => t.assigned_to)
          .filter(
            (id): id is string => typeof id === "string" && id.trim() !== ""
          );
        const uniqueUserIds: string[] = [...new Set(taskUserIds)];

        // Log for debugging
        console.log("Unique user IDs:", uniqueUserIds);

        // Fetch user details
        const userResponses = await Promise.all(
          uniqueUserIds.map(async (id: string) => {
            try {
              const user = await req.GET(
                `/admin/users?id=${encodeURIComponent(id)}`,
                session.user.token
              );
              return {
                id,
                first_name: user.first_name || "",
                last_name: user.last_name || "",
              };
            } catch (error) {
              console.error(`Failed to fetch user ${id}:`, error);
              return { id, first_name: "", last_name: "" };
            }
          })
        );

        const userMap = new Map<
          string,
          { first_name: string; last_name: string }
        >();
        userResponses.forEach((user) => {
          userMap.set(user.id, {
            first_name: user.first_name,
            last_name: user.last_name,
          });
        });

        // Map tasks with user names
        const mappedTasks: Task[] = response.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.due_date
            ? new Date(t.due_date).toISOString().split("T")[0]
            : "N/A",
          assignedTo: {
            user_id: t.assigned_to || "",
            first_name: t.assigned_to
              ? userMap.get(t.assigned_to)?.first_name || "Unknown"
              : "Unassigned",
            last_name: t.assigned_to
              ? userMap.get(t.assigned_to)?.last_name || "User"
              : "",
          },
          priority: t.priority,
        }));

        setTasks(mappedTasks);

        // Calculate stats
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
            new Date(t.dueDate) <=
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ).length;

        setStats([
          { title: "Pending Tasks", value: pendingTasks, icon: Clock },
          { title: "In Progress Tasks", value: inProgressTasks, icon: Users },
          {
            title: "Completed Tasks",
            value: completedTasks,
            icon: CheckCircle,
          },
          { title: "Due This Week", value: dueThisWeek, icon: Calendar },
        ]);
      } catch (error: any) {
        console.error("Failed to fetch tasks:", error);
        alert("Failed to load tasks: " + error.message);
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

    if (session) {
      fetchTasksAndUsers();
    }
  }, [session, router]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const isEmployee = !isAdmin && !isManager && roles.length > 0;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/protected/task/view/${taskId}`);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "assignedTo") {
      aValue =
        `${a.assignedTo.first_name} ${a.assignedTo.last_name}`.toLowerCase();
      bValue =
        `${b.assignedTo.first_name} ${b.assignedTo.last_name}`.toLowerCase();
    } else {
      aValue = aValue || "";
      bValue = bValue || "";
    }

    if (sortField === "dueDate") {
      const aDate =
        aValue === "N/A" ? Infinity : new Date(aValue as string).getTime();
      const bDate =
        bValue === "N/A" ? Infinity : new Date(bValue as string).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const filteredTasks = sortedTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) &&
      (filterStatus === "All" || task.status === filterStatus)
  );

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

  const exportToCSV = () => {
    const headers = ["ID,Title,Status,Due Date,Assigned To,Priority"];
    const rows = filteredTasks.map(
      (t) =>
        `${t.id},${t.title},${t.status},${t.dueDate},${t.assignedTo.first_name} ${t.assignedTo.last_name},${t.priority}`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Table View
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("title")}
          >
            Task Title <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("status")}
          >
            Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("dueDate")}
          >
            Due Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("assignedTo")}
          >
            Assigned To <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => handleSort("priority")}
          >
            Priority <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TableRow
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
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
              <TableCell>{`${task.assignedTo.first_name} ${task.assignedTo.last_name}`}</TableCell>
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

  // Render Grid View
  const renderGridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TooltipProvider key={task.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => handleTaskClick(task.id)}
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
                        {`${task.assignedTo.first_name} ${task.assignedTo.last_name}`}
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
                  {`${task.assignedTo.first_name} ${task.assignedTo.last_name}`}
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

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TooltipProvider key={task.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => handleTaskClick(task.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {task.dueDate} | Assigned:{" "}
                        {`${task.assignedTo.first_name} ${task.assignedTo.last_name}`}
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
                  {`${task.assignedTo.first_name} ${task.assignedTo.last_name}`}
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

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Search and Actions */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tasks хайх..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          {(isAdmin || isManager) && (
            <Button onClick={() => router.push("/protected/task/create")}>
              <CirclePlus className="mr-2 h-4 w-4" />
              Нэмэх
            </Button>
          )}
          <Button variant="outline" onClick={exportToCSV} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filterStatus === "All" ? "default" : "outline"}
              onClick={() => setFilterStatus("All")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "Pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("Pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "In Progress" ? "default" : "outline"}
              onClick={() => setFilterStatus("In Progress")}
            >
              In Progress
            </Button>
            <Button
              variant={filterStatus === "Completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("Completed")}
            >
              Completed
            </Button>
          </div>

          {/* Task Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {isLoading
              ? [...Array(4)].map((_, i) => (
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
              : stats.map((stat) => (
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

          {/* Task Actions and Quick Info */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {(isAdmin || isManager) && (
                  <Button
                    onClick={() => router.push("/protected/task/create")}
                    disabled={isLoading}
                  >
                    Assign New Task
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/protected/task/pending")}
                  disabled={isLoading}
                  variant="outline"
                >
                  View Pending Tasks
                </Button>
                <Button
                  onClick={() => router.push("/protected/task/all")}
                  disabled={isLoading}
                  variant="secondary"
                >
                  View All Tasks
                </Button>
                {isEmployee && (
                  <Button
                    onClick={() => router.push("/protected/task/my-tasks")}
                    disabled={isLoading}
                    variant="default"
                  >
                    My Tasks
                  </Button>
                )}
              </CardContent>
            </Card>

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
                      Total Tasks: {tasks.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In Progress:{" "}
                      {tasks.filter((t) => t.status === "In Progress").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed:{" "}
                      {tasks.filter((t) => t.status === "Completed").length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task List with View Modes */}
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
                <>
                  {viewMode === "table" && renderTableView()}
                  {viewMode === "grid" && renderGridView()}
                  {viewMode === "list" && renderListView()}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TasksPage;
