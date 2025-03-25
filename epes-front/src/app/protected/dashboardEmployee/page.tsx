// components/dashboard/employee.tsx
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
import { Clock, FileText, CheckCircle, Calendar } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: "Pending" | "Completed";
}

const mockStats: StatCard[] = [
  { title: "Pending Tasks", value: 5, icon: Clock },
  { title: "Completed Tasks", value: 12, icon: CheckCircle },
  { title: "Documents", value: 8, icon: FileText },
  { title: "Upcoming Events", value: 3, icon: Calendar },
];

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Submit monthly report",
    dueDate: "2025-03-28",
    status: "Pending",
  },
  {
    id: "2",
    title: "Review team feedback",
    dueDate: "2025-03-26",
    status: "Pending",
  },
  {
    id: "3",
    title: "Update profile info",
    dueDate: "2025-03-25",
    status: "Completed",
  },
  {
    id: "4",
    title: "Attend training",
    dueDate: "2025-03-27",
    status: "Pending",
  },
];

const EmployeeDashboard: React.FC = () => {
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

  // If user is only an employee (not admin or manager), proceed
  if (isAdmin || isManager) {
    // Optionally redirect admins/managers to their dashboards
    router.push(isAdmin ? "/admin" : "/dashboard/manager");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Employee Dashboard
          </h1>

          {/* Stats Cards */}
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

          {/* Employee Actions */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push("/employee/tasks")}
                  disabled={isLoading}
                >
                  View Tasks
                </Button>
                <Button
                  onClick={() => router.push("/employee/documents")}
                  disabled={isLoading}
                  variant="outline"
                >
                  My Documents
                </Button>
                <Button
                  onClick={() => router.push("/employee/profile")}
                  disabled={isLoading}
                  variant="secondary"
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Team Meeting - March 26, 2025</span>
                    </li>
                    <li className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Training Session - March 27, 2025</span>
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
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
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status}
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

export default EmployeeDashboard;
