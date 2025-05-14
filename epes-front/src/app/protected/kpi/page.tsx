// src/app/protected/kpi/page.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  CheckCircle,
  CirclePlus,
  Clock,
  Download,
  LayoutGrid,
  List,
  Table as TableIcon,
  Users,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { KPIStats } from "./components/KPIStats";
import { KPIActions } from "./components/KPIActions";
import { KPITable } from "./components/KPITable";
import { KPIGrid } from "./components/KPIGrid";
import { KPIList } from "./components/KPIList";
import { KPIReportDialog } from "./components/KPIReportDialog";
import { DeleteDialog } from "./components/DeleteDialog";
import { useKPI } from "./hooks/useKPI";
import {
  sortKPIs,
  filterKPIs,
  exportToCSV,
  generatePerformanceReport,
} from "./utils/kpiUtils";
import { EmployeeKPI, KPIStat, ReportConfig } from "./types";
import { motion, AnimatePresence } from "framer-motion";

// Custom debounce function
const debounce = <F extends (...args: any[]) => void>(
  func: F,
  wait: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Create QueryClient instance client-side
const KPIPage: React.FC = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <KPIPageContent />
    </QueryClientProvider>
  );
};

// Main page content
const KPIPageContent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { kpis, stats, isLoading, deleteKPI } = useKPI();

  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<keyof EmployeeKPI | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Excellent" | "Good" | "Needs Improvement"
  >("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    employeeId: "all",
    period: "allTime",
    includeTasks: true,
    includeProjects: true,
    includeComments: false,
  });

  // Load viewMode from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedViewMode = localStorage.getItem("kpiViewMode") as
        | "table"
        | "grid"
        | "list";
      if (storedViewMode) {
        setViewMode(storedViewMode);
      }
    }
  }, []);

  // Persist viewMode to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kpiViewMode", viewMode);
    }
  }, [viewMode]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setFilterStatus("All");
    setSortField(null);
    setSortDirection("asc");
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  }, [toast]);

  const handleSort = useCallback(
    (field: keyof EmployeeKPI) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const handleKPIClick = useCallback(
    (employeeId: string) => {
      router.push(`/protected/kpi/employee/${employeeId}`);
    },
    [router]
  );

  const handleEditKPI = useCallback(
    (employeeId: string) => {
      router.push(`/protected/kpi/edit/${employeeId}`);
    },
    [router]
  );

  const sortedKPIs = useMemo(
    () => sortKPIs(kpis, sortField, sortDirection),
    [kpis, sortField, sortDirection]
  );
  const filteredKPIs = useMemo(
    () => filterKPIs(sortedKPIs, searchTerm, filterStatus),
    [sortedKPIs, searchTerm, filterStatus]
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen bg-background p-6">
        <div className="flex-1 max-w-7xl mx-auto w-full">
          <Skeleton className="h-8 w-[200px] mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
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
    toast({
      title: "Access Denied",
      description: "Only admins can access this page.",
      variant: "destructive",
    });
    router.push("/protected");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background p-6">
      <div className="flex-1 max-w-7xl mx-auto w-full">
        <Card className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search employees..."
                className="pl-8 pr-8 w-full sm:w-[250px] lg:w-[350px]"
                aria-label="Search employee KPIs"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2.5"
                  onClick={() => {
                    setSearchInput("");
                    setSearchTerm("");
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                onClick={() => router.push("/protected/kpi/create")}
                disabled={isLoading}
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                Add KPI
              </Button>
              <Button
                variant="outline"
                onClick={() => exportToCSV(filteredKPIs)}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <main className="p-4 sm:p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Employee KPIs
            </h1>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value: "table" | "grid" | "list") =>
                value && setViewMode(value)
              }
              className="flex gap-2"
              aria-label="Select view mode"
            >
              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Card className="mb-6">
            <CardContent className="flex flex-wrap gap-2 p-4">
              <Button
                variant={filterStatus === "All" ? "default" : "outline"}
                onClick={() => setFilterStatus("All")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "Excellent" ? "default" : "outline"}
                onClick={() => setFilterStatus("Excellent")}
              >
                Excellent
              </Button>
              <Button
                variant={filterStatus === "Good" ? "default" : "outline"}
                onClick={() => setFilterStatus("Good")}
              >
                Good
              </Button>
              <Button
                variant={
                  filterStatus === "Needs Improvement" ? "default" : "outline"
                }
                onClick={() => setFilterStatus("Needs Improvement")}
              >
                Needs Improvement
              </Button>
            </CardContent>
          </Card>

          <KPIStats stats={stats} isLoading={isLoading} />

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <KPIActions
                  isLoading={isLoading}
                  onCreate={() => router.push("/protected/kpi/create")}
                  onGenerateReport={() => setReportDialogOpen(true)}
                  onViewExcellent={() => setFilterStatus("Excellent")}
                  onViewAll={() => resetFilters()}
                />
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
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Employees
                      </span>
                      <span className="text-sm font-medium">{kpis.length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Excellent
                      </span>
                      <span className="text-sm font-medium">
                        {stats.find((s) => s.title === "Excellent Performers")
                          ?.value || 0}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Avg Score
                      </span>
                      <span className="text-sm font-medium">
                        {stats.find((s) => s.title === "Avg Performance Score")
                          ?.value || 0}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee KPI List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredKPIs.length === 0 ? (
                <p className="text-center">
                  No employee KPIs found. Try adjusting your filters.
                </p>
              ) : (
                <AnimatePresence mode="wait">
                  {viewMode === "table" && (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <KPITable
                        kpis={filteredKPIs}
                        onSort={handleSort}
                        onClick={handleKPIClick}
                        onEdit={handleEditKPI}
                        onDelete={(id) => {
                          setEmployeeToDelete(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </motion.div>
                  )}
                  {viewMode === "grid" && (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <KPIGrid
                        kpis={filteredKPIs}
                        onClick={handleKPIClick}
                        onEdit={handleEditKPI}
                        onDelete={(id) => {
                          setEmployeeToDelete(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </motion.div>
                  )}
                  {viewMode === "list" && (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <KPIList
                        kpis={filteredKPIs}
                        onClick={handleKPIClick}
                        onEdit={handleEditKPI}
                        onDelete={(id) => {
                          setEmployeeToDelete(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </main>

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={() => {
            if (employeeToDelete) deleteKPI(employeeToDelete);
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
          }}
        />

        <KPIReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          kpis={kpis}
          config={reportConfig}
          setConfig={setReportConfig}
          onGenerate={() => {
            generatePerformanceReport(kpis, reportConfig);
            toast({
              title: "Success",
              description: "Performance report generated successfully as PDF.",
            });
            setReportDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default KPIPage;
