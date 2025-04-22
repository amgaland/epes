// src/app/protected/task/page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CirclePlus,
  LayoutGrid,
  List,
  Table as TableIcon,
  Download,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TaskTable } from "./components/TaskTable";
import { TaskGrid } from "./components/TaskGrid";
import { TaskList } from "./components/TaskList";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { useTasks } from "./hooks/useTasks";
import { sortTasks, filterTasks, exportToCSV } from "./utils/taskUtils";
import { Task } from "./types";

export default function TasksPage() {
  const {
    session,
    status,
    isLoading,
    tasks,
    stats,
    isAdmin,
    isManager,
    isEmployee,
    router,
    refetchTasks,
  } = useTasks();

  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<keyof Task | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Pending" | "In Progress" | "Completed"
  >("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    router.push("/auth/signin");
    return null;
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const sortedTasks = sortTasks(tasks, sortField, sortDirection);
  const filteredTasks = filterTasks(sortedTasks, searchTerm, filterStatus);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search task..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          {(isAdmin || isManager) && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <CirclePlus className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => exportToCSV(filteredTasks)}
            disabled={isLoading}
          >
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-[100px]" />
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

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {(isAdmin || isManager) && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
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
                  {viewMode === "table" && (
                    <TaskTable
                      tasks={filteredTasks}
                      onSort={(field) => {
                        if (sortField === field) {
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortField(field);
                          setSortDirection("asc");
                        }
                      }}
                      onTaskClick={(taskId) =>
                        router.push(`/protected/task/view/${taskId}`)
                      }
                    />
                  )}
                  {viewMode === "grid" && (
                    <TaskGrid
                      tasks={filteredTasks}
                      onTaskClick={(taskId) =>
                        router.push(`/protected/task/view/${taskId}`)
                      }
                    />
                  )}
                  {viewMode === "list" && (
                    <TaskList
                      tasks={filteredTasks}
                      onTaskClick={(taskId) =>
                        router.push(`/protected/task/view/${taskId}`)
                      }
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>

        {(isAdmin || isManager) && (
          <CreateTaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              refetchTasks();
            }}
          />
        )}
      </div>
    </div>
  );
}
