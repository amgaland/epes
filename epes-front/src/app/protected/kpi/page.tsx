// src/app/protected/kpi/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { Search } from "lucide-react";
import { KPIStats } from "./components/KPIStats";
import { KPIActions } from "./components/KPIActions";
import { KPITable } from "./components/KPITable";
import { KPIGrid } from "./components/KPIGrid";
import { KPIList } from "./components/KPIList";
import { KPIReportDialog } from "./components/KPIReportDialog";
import { DeleteDialog } from "./components/DeleteDialog";
import { fetchEmployeeKPIs } from "./services/kpiService";
import {
  sortKPIs,
  filterKPIs,
  exportToCSV,
  generatePerformanceReport,
} from "./utils/kpiUtils";
import { EmployeeKPI, KPIStat, ReportConfig } from "./types";
import { deleteKPI } from "./services/kpiService";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token missing. Please log in again.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        const kpiData = await fetchEmployeeKPIs(session.user.token);
        setKPIs(kpiData);

        const excellentPerformers = kpiData.filter(
          (k) => k.status === "Excellent"
        ).length;
        const goodPerformers = kpiData.filter(
          (k) => k.status === "Good"
        ).length;
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

        setStats([
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
        ]);
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
  }, [session, router, toast]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput);
    }
  };

  const handleSort = (field: keyof EmployeeKPI) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleKPIClick = (employeeId: string) => {
    router.push(`/protected/kpi/employee/${employeeId}`);
  };

  const handleEditKPI = (employeeId: string) => {
    router.push(`/protected/kpi/edit/${employeeId}`);
  };

  const handleDeleteKPI = async () => {
    if (!employeeToDelete || !session?.user?.token) return;

    try {
      await deleteKPI(employeeToDelete, session.user.token);
      setKPIs(kpis.filter((kpi) => kpi.employeeId !== employeeToDelete));
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
  };

  const sortedKPIs = sortKPIs(kpis, sortField, sortDirection);
  const filteredKPIs = filterKPIs(sortedKPIs, searchTerm, filterStatus);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <KPIStats stats={[]} isLoading={true} />
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
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
              placeholder="Employees хайх..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Button onClick={() => router.push("/protected/kpi/create")}>
            <CirclePlus className="mr-2 h-4 w-4" />
            Нэмэх
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToCSV(filteredKPIs)}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Employee KPIs</h1>
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
          </div>

          <KPIStats stats={stats} isLoading={isLoading} />

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <KPIActions
              isLoading={isLoading}
              onCreate={() => router.push("/protected/kpi/create")}
              onGenerateReport={() => setReportDialogOpen(true)}
              onViewExcellent={() => router.push("/protected/kpi/excellent")}
              onViewAll={() => router.push("/protected/kpi/all")}
            />
            <div>
              <h2 className="text-lg font-medium mb-2">Quick Info</h2>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total Employees: {kpis.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Excellent:{" "}
                    {kpis.filter((k) => k.status === "Excellent").length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg Score:{" "}
                    {kpis.length > 0
                      ? Math.round(
                          kpis.reduce((sum, k) => sum + k.performanceScore, 0) /
                            kpis.length
                        )
                      : 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Employee KPI List</h2>
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
          </div>
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
