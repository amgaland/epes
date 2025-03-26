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
import {
  Calendar,
  Clock,
  Users,
  Folder,
  Search,
  CirclePlus,
  LayoutGrid,
  List,
  Table as TableIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
  // Move all Hooks to the top
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Early returns after all Hooks are called
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
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm)
  );

  // Render Table View
  const renderTableView = () => (
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
        {filteredProjects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name}</TableCell>
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
  );

  // Render Grid View
  const renderGridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
              <p className="text-sm text-muted-foreground">
                Due: {project.dueDate}
              </p>
              <p className="text-sm text-muted-foreground">
                Team: {project.teamSize} members
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {filteredProjects.map((project) => (
        <Card key={project.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <h3 className="text-lg font-medium">{project.name}</h3>
              <p className="text-sm text-muted-foreground">
                Due: {project.dueDate} | Team: {project.teamSize}
              </p>
            </div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
              placeholder="Projects хайх..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Button onClick={() => router.push("/protected/project/create")}>
            <CirclePlus />
            Нэмэх
          </Button>
        </div>

        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            {/* View Switcher */}
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

          {/* Project Actions and Quick Info */}
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

          {/* Project List with View Modes */}
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

export default ProjectsPage;
