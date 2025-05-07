"use client";
import { useState } from "react"; // Ensure useState is imported first
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CirclePlus,
  LayoutGrid,
  List,
  Table as TableIcon,
  Download,
} from "lucide-react";
import { useProjects } from "./hooks/useProjects";
import { SearchBar } from "./components/SearchBar";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectActions } from "./components/ProjectActions";
import { QuickInfo } from "./components/QuickInfo";
import { ProjectTable } from "./components/ProjectTable";
import { ProjectGrid } from "./components/ProjectGrid";
import { ProjectList } from "./components/ProjectList";
import {
  sortProjects,
  filterProjects,
  exportToCSV,
} from "../project/utils/projectUtils";
import { Project } from "./types";
import CreateProjectModal from "./create/page";

export default function ProjectsPage() {
  const {
    session,
    status,
    isLoading,
    projects,
    stats,
    isAdmin,
    isManager,
    isEmployee,
    isEmployeeOnly,
    router,
  } = useProjects();

  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<keyof Project | null>(null); // Fixed typo from кадровField
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Pending" | "Completed" | "My Projects"
  >(isEmployeeOnly ? "My Projects" : "All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(isEmployeeOnly ? 2 : 4)].map((_, i) => (
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

  const sortedProjects = sortProjects(projects, sortField, sortDirection);
  const filteredProjects = filterProjects(
    sortedProjects,
    searchTerm,
    filterStatus,
    session.user.id
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Search and Actions */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            setSearchTerm={setSearchTerm}
          />
          {(isAdmin || isManager) && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <CirclePlus />
              Add
            </Button>
          )}
          {(isAdmin || isManager) && (
            <Button
              variant="outline"
              onClick={() => exportToCSV(filteredProjects)}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
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
            {!isEmployeeOnly && (
              <>
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
              </>
            )}
            {(isEmployee || isEmployeeOnly) && (
              <Button
                variant={filterStatus === "My Projects" ? "default" : "outline"}
                onClick={() => setFilterStatus("My Projects")}
              >
                My Projects
              </Button>
            )}
          </div>

          {/* Project Stats */}
          <ProjectStats
            stats={stats}
            isLoading={isLoading}
            isEmployeeOnly={isEmployeeOnly}
          />

          {/* Project Actions and Quick Info */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <ProjectActions
              isAdmin={isAdmin}
              isManager={isManager}
              isLoading={isLoading}
            />
            <QuickInfo
              projects={projects}
              isLoading={isLoading}
              isAdmin={isAdmin}
              isManager={isManager}
            />
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
              ) : filteredProjects.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {filterStatus === "My Projects"
                    ? "No projects assigned to you."
                    : "No projects match the current filters."}
                </p>
              ) : (
                <>
                  {viewMode === "table" && (
                    <ProjectTable
                      projects={filteredProjects}
                      handleSort={handleSort}
                      handleProjectClick={handleProjectClick}
                    />
                  )}
                  {viewMode === "grid" && (
                    <ProjectGrid
                      projects={filteredProjects}
                      handleProjectClick={handleProjectClick}
                    />
                  )}
                  {viewMode === "list" && (
                    <ProjectList
                      projects={filteredProjects}
                      handleProjectClick={handleProjectClick}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Create Project Modal */}
        {(isAdmin || isManager) && (
          <CreateProjectModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}
