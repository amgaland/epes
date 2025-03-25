// components/dashboard/admin.tsx
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
import {
  BarChart2,
  FileText,
  Users,
  Shield,
  Lock,
  Activity,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

interface UserData {
  id: string;
  username: string;
  role: string;
  status: "Active" | "Suspended";
}

const mockStats: StatCard[] = [
  { title: "Total Users", value: 150, icon: Users },
  { title: "Documents", value: 245, icon: FileText },
  { title: "Active Branches", value: 8, icon: BarChart2 },
  { title: "System Alerts", value: 3, icon: Shield },
];

const mockUsers: UserData[] = [
  { id: "1", username: "admin1", role: "admin", status: "Active" },
  { id: "2", username: "manager1", role: "manager", status: "Active" },
  { id: "3", username: "user1", role: "user", status: "Suspended" },
  { id: "4", username: "manager2", role: "manager", status: "Active" },
];

const AdminDashboard: React.FC = () => {
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

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");

  if (!isAdmin) {
    router.push("/unauthorized");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Admin Dashboard
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

          {/* Admin Controls */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push("/admin/user")}
                  disabled={isLoading}
                >
                  Manage Users
                </Button>
                <Button
                  onClick={() => router.push("/admin/role")}
                  disabled={isLoading}
                  variant="outline"
                >
                  Manage Roles
                </Button>
                <Button
                  onClick={() => router.push("/admin/action")}
                  disabled={isLoading}
                  variant="secondary"
                >
                  System Actions
                </Button>
              </CardContent>
            </Card>

            {/* Security Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Security Controls</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push("/admin/security")}
                  disabled={isLoading}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
                <Button
                  onClick={() => router.push("/admin/activity")}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User Management Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
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
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
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

export default AdminDashboard;
