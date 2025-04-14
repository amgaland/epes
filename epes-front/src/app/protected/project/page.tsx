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
  Calendar,
  Clock,
  Users,
  Folder,
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
  progress?: number;
  teamMembers?: { user_id: string; name: string; role_in_project: string }[];
}

const ProjectsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStat[]>([]);
  const [sortField, setSortField] = useState<keyof Project | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Pending" | "Completed"
  >("All");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.token) {
        console.error("No token available in session:", session);
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await req.GET(
          "/protected/projects",
          session.user.token
        );
        const mappedProjects: Project[] = response.map((p: any) => ({
          id: p.id,
          name: p.name,
          status:
            p.status === "Ongoing"
              ? "Active"
              : (p.status as "Pending" | "Completed"),
          dueDate: p.end_date
            ? new Date(p.end_date).toISOString().split("T")[0]
            : "N/A",
          teamSize: p.team_members?.length || 0,
          progress: p.progress || Math.floor(Math.random() * 100),
          teamMembers: p.team_members || [],
        }));
        setProjects(mappedProjects);

        const activeProjects = mappedProjects.filter(
          (p) => p.status === "Active"
        ).length;
        const totalTeamSize = mappedProjects.reduce(
          (sum, p) => sum + p.teamSize,
          0
        );
        const pendingProjects = mappedProjects.filter(
          (p) => p.status === "Pending"
        ).length;
        const upcomingDeadlines = mappedProjects.filter(
          (p) =>
            p.status !== "Completed" &&
            new Date(p.dueDate) <=
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ).length;

        setStats([
          { title: "Active Projects", value: activeProjects, icon: Folder },
          { title: "Team Members", value: totalTeamSize, icon: Users },
          { title: "Pending Tasks", value: pendingProjects, icon: Clock },
          {
            title: "Upcoming Deadlines",
            value: upcomingDeadlines,
            icon: Calendar,
          },
        ]);
      } catch (error: any) {
        console.error("Failed to fetch projects:", error);
        alert("Failed to load projects: " + error.message);
        setProjects([]);
        setStats([
          { title: "Active Projects", value: 0, icon: Folder },
          { title: "Team Members", value: 0, icon: Users },
          { title: "Pending Tasks", value: 0, icon: Clock },
          { title: "Upcoming Deadlines", value: 0, icon: Calendar },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      console.log("Session:", session);
      fetchProjects();
    }
  }, [session, router]);

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
  const isManager = roles.includes("MANAGER");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/protected/project/view/${projectId}`);
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || bValue === undefined) return 0;

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

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const filteredProjects = sortedProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm) &&
      (filterStatus === "All" || project.status === filterStatus)
  );

  const exportToCSV = () => {
    const headers = ["ID,Name,Status,Due Date,Team Size,Progress"];
    const rows = filteredProjects.map(
      (p) =>
        `${p.id},${p.name},${p.status},${p.dueDate},${p.teamSize},${p.progress || "N/A"}`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "projects.csv");
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
            onClick={() => handleSort("name")}
          >
            Project Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
            onClick={() => handleSort("teamSize")}
          >
            Team Size <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead>Progress</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <TableRow
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="cursor-pointer hover:bg-muted"
            >
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
              <TableCell>
                <Progress value={project.progress || 0} className="w-[60%]" />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No projects found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  // Render Grid View
  const renderGridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => (
          <TooltipProvider key={project.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => handleProjectClick(project.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
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
                      <Progress value={project.progress || 0} />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Team Members:</p>
                <ul>
                  {project.teamMembers?.map((member) => (
                    <li key={member.user_id}>
                      {member.name} ({member.role_in_project})
                    </li>
                  )) || <li>No team members assigned</li>}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      ) : (
        <p className="text-center col-span-full">No projects found.</p>
      )}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => (
          <TooltipProvider key={project.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => handleProjectClick(project.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {project.dueDate} | Team: {project.teamSize}
                      </p>
                      <Progress
                        value={project.progress || 0}
                        className="w-[200px]"
                      />
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Team Members:</p>
                <ul>
                  {project.teamMembers?.map((member) => (
                    <li key={member.user_id}>
                      {member.name} ({member.role_in_project})
                    </li>
                  )) || <li>No team members assigned</li>}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      ) : (
        <p className="text-center">No projects found.</p>
      )}
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
          <Button variant="outline" onClick={exportToCSV} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
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
              variant={filterStatus === "Active" ? "default" : "outline"}
              onClick={() => setFilterStatus("Active")}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === "Pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("Pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "Completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("Completed")}
            >
              Completed
            </Button>
          </div>

          {/* Project Stats */}
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

          {/* Project Actions and Quick Info */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {(isAdmin || isManager) && (
                  <Button
                    onClick={() => router.push("/protected/project/create")}
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
                      Total Projects: {projects.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active:{" "}
                      {projects.filter((p) => p.status === "Active").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed:{" "}
                      {projects.filter((p) => p.status === "Completed").length}
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
