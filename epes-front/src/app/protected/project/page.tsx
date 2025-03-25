// app/projects/page.tsx
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
import { Calendar, Clock, Users, Folder } from "lucide-react";

interface ProjectStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

interface Project {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Completed";
  dueDate: string;
  teamSize: number;
}

const mockStats: ProjectStat[] = [
  { title: "Active Projects", value: 7, icon: Folder },
  { title: "Team Members", value: 25, icon: Users },
  { title: "Pending Tasks", value: 15, icon: Clock },
  { title: "Upcoming Deadlines", value: 4, icon: Calendar },
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    status: "Active",
    dueDate: "2025-04-15",
    teamSize: 5,
  },
  {
    id: "2",
    name: "Mobile App Development",
    status: "Pending",
    dueDate: "2025-05-01",
    teamSize: 8,
  },
  {
    id: "3",
    name: "Database Migration",
    status: "Completed",
    dueDate: "2025-03-20",
    teamSize: 3,
  },
  {
    id: "4",
    name: "Marketing Campaign",
    status: "Active",
    dueDate: "2025-04-10",
    teamSize: 6,
  },
];

const ProjectsPage: React.FC = () => {
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

  // All roles can access projects, but features may differ
  // If you want to restrict access, add conditions here
  // e.g., if (!isAdmin && !isManager) router.push("/unauthorized");

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Projects</h1>

          {/* Project Stats */}
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

          {/* Project Actions */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {(isAdmin || isManager) && (
                  <Button
                    onClick={() => router.push("/projects/new")}
                    disabled={isLoading}
                  >
                    Create New Project
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/projects/active")}
                  disabled={isLoading}
                  variant="outline"
                >
                  View Active Projects
                </Button>
                <Button
                  onClick={() => router.push("/projects/all")}
                  disabled={isLoading}
                  variant="secondary"
                >
                  View All Projects
                </Button>
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
                      Total Projects: {mockProjects.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active:{" "}
                      {mockProjects.filter((p) => p.status === "Active").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed:{" "}
                      {
                        mockProjects.filter((p) => p.status === "Completed")
                          .length
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project List */}
          <Card>
            <CardHeader>
              <CardTitle>Project List</CardTitle>
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
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Team Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          {project.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              project.status === "Active"
                                ? "default"
                                : project.status === "Completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{project.dueDate}</TableCell>
                        <TableCell>{project.teamSize}</TableCell>
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

export default ProjectsPage;
