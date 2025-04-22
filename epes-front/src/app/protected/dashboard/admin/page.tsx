"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Users,
  ListCheck,
  NotebookPen,
  Sun,
  Moon,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminDashboard } from "../components/AdminDashboard";
import { fetchDashboardData } from "../services/dashboardService";
import { DashboardData } from "../types";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<DashboardData>({ kpis: [], stats: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const dashboardData = await fetchDashboardData(
          "ADMIN",
          session.user.token
        );
        setData(dashboardData);
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        setError(error.message || "Failed to load dashboard data.");
        toast({
          title: "Error",
          description: "Failed to load dashboard: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [session, status, toast]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchDashboardData("ADMIN", session?.user?.token || "")
      .then((dashboardData) => {
        setData(dashboardData);
        setIsLoading(false);
      })
      .catch((error: any) => {
        setError(error.message || "Failed to load dashboard data.");
        toast({
          title: "Error",
          description: "Failed to load dashboard: " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      });
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // Derive summary stats from data.kpis and data.stats
  const summaryStats = [
    {
      title: "Total Employees",
      value: data.kpis.length || 0,
      icon: Users,
      tooltip: "Number of employees with KPI records",
    },
    {
      title: "Active Projects",
      value:
        data.stats.find((stat) => stat.title === "Active Projects")?.value || 0,
      icon: ListCheck,
      tooltip: "Number of ongoing projects",
    },
    {
      title: "Average KPI Score",
      value:
        data.kpis.length > 0
          ? Math.round(
              data.kpis.reduce(
                (sum, kpi) => sum + (kpi.performanceScore || 0),
                0
              ) / data.kpis.length
            )
          : 0,
      icon: NotebookPen,
      tooltip: "Average performance score across all employees",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* SideBar (assumed to be rendered by layout) */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        {/* Header */}
        <Card className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="outline"
                onClick={() => router.push("/protected/user")}
                className="w-full sm:w-auto"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/protected/project")}
                className="w-full sm:w-auto"
              >
                <ListCheck className="mr-2 h-4 w-4" />
                View Projects
              </Button>
              <Button
                onClick={() => router.push("/protected/kpi/create")}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add KPI
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-full sm:w-auto"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <main className="p-4 sm:p-6 flex-1">
          {error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-6 w-1/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-[200px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <TooltipProvider>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                  {summaryStats.map((stat) => (
                    <Card key={stat.title}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <stat.icon className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {stat.title}
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-2xl font-semibold">
                                {stat.value > 0 ? stat.value : "N/A"}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{stat.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TooltipProvider>

              {/* Main Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.kpis.length === 0 && data.stats.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                      No dashboard data available.
                    </p>
                  ) : (
                    <AdminDashboard data={data} isLoading={isLoading} />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </main>
    </div>
  );
}
