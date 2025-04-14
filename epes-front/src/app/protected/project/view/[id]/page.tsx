"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { req } from "@/app/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Edit,
  Users,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
} from "lucide-react";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface ProjectMember {
  user_id: string;
  role_in_project: string;
  first_name: string;
  last_name: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: "Ongoing" | "Completed" | "Delayed";
  owner_id: string;
  owner: User;
  team_members: ProjectMember[];
}

const ViewProjectPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "badges">("table");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectMember;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    const fetchProjectAndUsers = async () => {
      if (!session?.user?.token) {
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);

        // Fetch project details
        const projectResponse = await req.GET(
          `/protected/projects?id=${projectId}`,
          session.user.token
        );

        // Extract unique user IDs (owner and team members)
        const ownerId = projectResponse.owner_id;
        const teamMemberIds = projectResponse.team_members.map(
          (m: any) => m.user_id
        );
        const allUserIds = [ownerId, ...teamMemberIds].filter(
          (id, index, self) => self.indexOf(id) === index
        );

        // Fetch user details for all IDs
        const userResponses = await Promise.all(
          allUserIds.map(async (id) => {
            try {
              const response = await req.GET(
                `/admin/users?id=${id}`,
                session.user.token
              );
              return {
                id,
                first_name: response.first_name || "",
                last_name: response.last_name || "",
              };
            } catch (error) {
              console.error(`Failed to fetch user ${id}:`, error);
              return { id, first_name: "", last_name: "" };
            }
          })
        );
        console.log("herere", userResponses);

        // Create a map of user_id to user details
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

        // Construct project with proper user names
        setProject({
          id: projectResponse.id,
          name: projectResponse.name,
          description: projectResponse.description || "",
          start_date: projectResponse.start_date,
          end_date: projectResponse.end_date,
          status: projectResponse.status,
          owner_id: projectResponse.owner_id,
          owner: {
            id: projectResponse.owner_id,
            first_name:
              userMap.get(projectResponse.owner_id)?.first_name || "Unknown",
            last_name:
              userMap.get(projectResponse.owner_id)?.last_name || "User",
          },
          team_members: projectResponse.team_members.map((m: any) => ({
            user_id: m.user_id,
            role_in_project: m.role_in_project,
            first_name: userMap.get(m.user_id)?.first_name || "Unknown",
            last_name: userMap.get(m.user_id)?.last_name || "User",
          })),
        });
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load project or user details: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (session && projectId) {
      fetchProjectAndUsers();
    }
  }, [session, projectId, router]);

  const handleSort = (key: keyof ProjectMember) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const sortedMembers = project?.team_members
    ? [...project.team_members].sort((a, b) => {
        if (!sortConfig) return 0;
        const aValue = (a[sortConfig.key] || "").toLowerCase();
        const bValue = (b[sortConfig.key] || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      })
    : [];

  const filteredMembers = sortedMembers.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.trim();
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role_in_project.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

  const roles = session?.user?.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const canEdit = isAdmin || isManager;

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "Delayed":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case "Completed":
        return 100;
      case "Delayed":
        return 50;
      default:
        return 75;
    }
  };

  const getDisplayName = (user: User | ProjectMember) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || "Unknown User";
  };

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
                    onClick={() => router.push("/protected/project")}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to Projects</TooltipContent>
              </Tooltip>
              <h1 className="text-2xl font-semibold tracking-tight">
                {isLoading ? "Loading..." : project?.name || "Project"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && project && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/protected/project/edit/${projectId}`)
                      }
                      className="hover:bg-muted"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit project details</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("table")}
                    className="hover:bg-muted"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Table View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "badges" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("badges")}
                    className="hover:bg-muted"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Badge View</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {isLoading ? (
            <Card className="shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[300px]" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : !project ? (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  Project not found.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                  <CardDescription>Overview of the project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Name
                      </Label>
                      <p className="text-base">{project.name}</p>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Status
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getStatusColor(project.status)} text-white`}
                        >
                          {project.status}
                        </Badge>
                        <Progress
                          value={getProgressValue(project.status)}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Owner
                      </Label>
                      <p className="text-base">
                        {getDisplayName(project.owner)}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Start Date
                      </Label>
                      <p className="text-base">
                        {formatDate(project.start_date)}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        End Date
                      </Label>
                      <p className="text-base">
                        {formatDate(project.end_date)}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-base whitespace-pre-wrap leading-relaxed">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Assigned team members and their roles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {filteredMembers.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                      No team members found.
                    </p>
                  ) : viewMode === "table" ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("first_name")}
                              className="flex items-center gap-1"
                            >
                              Name
                              {sortConfig?.key === "first_name" && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("role_in_project")}
                              className="flex items-center gap-1"
                            >
                              Role
                              {sortConfig?.key === "role_in_project" && (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMembers.map((member) => (
                          <TableRow key={member.user_id}>
                            <TableCell className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>
                                      {member.first_name
                                        ? member.first_name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {getDisplayName(member)}
                                </TooltipContent>
                              </Tooltip>
                              {getDisplayName(member)}
                            </TableCell>
                            <TableCell>{member.role_in_project}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {filteredMembers.map((member) => (
                        <Tooltip key={member.user_id}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="px-3 py-2 flex items-center gap-2 hover:bg-muted cursor-pointer"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {member.first_name
                                    ? member.first_name.charAt(0).toUpperCase()
                                    : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {getDisplayName(member)} (
                                {member.role_in_project})
                              </span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getDisplayName(member)}</p>
                            <p className="text-muted-foreground">
                              Role: {member.role_in_project}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ViewProjectPage;
