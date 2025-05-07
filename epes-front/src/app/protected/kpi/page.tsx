"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import { Search } from "lucide-react";
import { KPIStats } from "./components/KPIStats";
import { KPIActions } from "./components/KPIActions";
import { KPITable } from "./components/KPITable";
import { KPIGrid } from "./components/KPIGrid";
import { KPIList } from "./components/KPIList";
import { KPIReportDialog } from "./components/KPIReportDialog";
import { DeleteDialog } from "./components/DeleteDialog";
import { fetchEmployeeKPIs, deleteKPI } from "./services/kpiService";
import {
  sortKPIs,
  filterKPIs,
  exportToCSV,
  generatePerformanceReport,
} from "./utils/kpiUtils";
import { EmployeeKPI, KPIStat, ReportConfig } from "./types";

// Custom debounce function to avoid lodash dependency
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

const KPIPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [kpis, setKPIs] = useState<EmployeeKPI[]>([]);
  const [stats, setStats] = useState<KPIStat[]>([]);
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

  // Centralized KPI metrics calculation
  const calculateKPIMetrics = useCallback((kpiData: EmployeeKPI[]) => {
    const excellentPerformers = kpiData.filter(
      (k) => k.status === "Excellent"
    ).length;
    const goodPerformers = kpiData.filter((k) => k.status === "Good").length;
    const needsImprovement = kpiData.filter(
      (k) => k.status === "Needs Improvement"
    ).length;
    const avgPerformanceScore =
      kpiData.length > 0
        ? Math.round(
            kpiData.reduce((sum, k) => sum + k.performanceScore, 0) /
              kpiData.length
          )
        : 0;
    const totalEmployees = kpiData.length;

    return {
      stats: [
        {
          title: "Excellent Performers",
          value: excellentPerformers,
          icon: CheckCircle,
        },
        { title: "Good Performers", value: goodPerformers, icon: Users },
        { title: "Needs Improvement", value: needsImprovement, icon: Clock },
        {
          title: "Avg Performance Score",
          value: avgPerformanceScore,
          icon: BarChart,
        },
      ],
      metrics: {
        totalEmployees,
        excellentPerformers,
        avgPerformanceScore,
      },
    };
  }, []);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Reset all filters
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

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token missing. Please log in again.",
          variant: "destructive",
        });
        router.push("/auth/signin");
        return;
      }

      try {
        setIsLoading(true);
        const kpiData = await fetchEmployeeKPIs(session.user.token);
        setKPIs(kpiData);

        const { stats } = calculateKPIMetrics(kpiData);
        setStats(stats);
      } catch (error: any) {
        console.error("Failed to fetch KPIs:", error);
        toast({
          title: "Error",
          description: "Failed to load KPIs: " + error.message,
          variant: "destructive",
        });
        setKPIs([]);
        setStats([
          { title: "Excellent Performers", value: 0, icon: CheckCircle },
          { title: "Good Performers", value: 0, icon: Users },
          { title: "Needs Improvement", value: 0, icon: Clock },
          { title: "Avg Performance Score", value: 0, icon: BarChart },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, router, toast, debouncedSearch, calculateKPIMetrics]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");

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

  const handleDeleteKPI = useCallback(async () => {
    if (!employeeToDelete || !session?.user?.token) return;

    try {
      await deleteKPI(employeeToDelete, session.user.token);
      setKPIs((prev) =>
        prev.filter((kpi) => kpi.employeeId !== employeeToDelete)
      );
      const { stats } = calculateKPIMetrics(
        kpis.filter((kpi) => kpi.employeeId !== employeeToDelete)
      );
      setStats(stats);
      toast({
        title: "Success",
        description: "KPI record deleted successfully.",
      });
    } catch (error: any) {
      console.error("Failed to delete KPI:", error);
      toast({
        title: "Error",
        description: "Failed to delete KPI: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  }, [employeeToDelete, session, toast, kpis, calculateKPIMetrics]);

  const sortedKPIs = useMemo(
    () => sortKPIs(kpis, sortField, sortDirection),
    [kpis, sortField, sortDirection]
  );
  const filteredKPIs = useMemo(
    () => filterKPIs(sortedKPIs, searchTerm, filterStatus),
    [sortedKPIs, searchTerm, filterStatus]
  );

  // Calculate metrics for Quick Info
  const { metrics } = useMemo(
    () => calculateKPIMetrics(kpis),
    [kpis, calculateKPIMetrics]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-4 sm:p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <KPIStats stats={[]} isLoading={true} />
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/auth/signin");
    return null;
  }

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
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        {/* Search and Actions */}
        <Card className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search employees..."
                className="pl-8 w-full sm:w-[250px] lg:w-[350px]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button onClick={() => router.push("/protected/kpi/create")}>
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
              <Button variant="outline" onClick={resetFilters}>
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
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
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
                  onViewExcellent={() =>
                    router.push("/protected/kpi/excellent")
                  }
                  onViewAll={() => router.push("/protected/kpi/all")}
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
                      <span className="text-sm font-medium">
                        {metrics.totalEmployees}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Excellent
                      </span>
                      <span className="text-sm font-medium">
                        {metrics.excellentPerformers}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Avg Score
                      </span>
                      <span className="text-sm font-medium">
                        {metrics.avgPerformanceScore}
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
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  {viewMode === "table" && (
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
                  )}
                  {viewMode === "grid" && (
                    <KPIGrid
                      kpis={filteredKPIs}
                      onClick={handleKPIClick}
                      onEdit={handleEditKPI}
                      onDelete={(id) => {
                        setEmployeeToDelete(id);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  )}
                  {viewMode === "list" && (
                    <KPIList
                      kpis={filteredKPIs}
                      onClick={handleKPIClick}
                      onEdit={handleEditKPI}
                      onDelete={(id) => {
                        setEmployeeToDelete(id);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteKPI}
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
