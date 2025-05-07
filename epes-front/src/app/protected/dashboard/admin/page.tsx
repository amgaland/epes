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
  ArrowLeft,
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
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast() as { toast: any };
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [data, setData] = useState<DashboardData>({ kpis: [], stats: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      if (!session?.user?.token || !session?.user?.roles?.includes("ADMIN")) {
        toast.toast({
          title: "Authentication Error",
          description: "You must be an admin to view this dashboard.",
          variant: "destructive",
        });
        router.push("/");
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
        setError(error.message || "Failed to load dashboard data.");
        toast.toast({
          title: "Error",
          description: `Failed to load dashboard: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, toast, router]);

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboardData = await fetchDashboardData(
        "ADMIN",
        session?.user?.token || ""
      );
      setData(dashboardData);
    } catch (error: any) {
      setError(error.message || "Failed to load dashboard data.");
      toast.toast({
        title: "Error",
        description: `Failed to load dashboard: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleDebugMode = () => setDebugMode((prev) => !prev);

  const summaryStats = [
    {
      title: "Total Employees",
      value: data.kpis.length || 0,
      icon: Users,
      tooltip: "Number of employees with KPI records",
      link: "/protected/user",
    },
    {
      title: "Active Projects",
      value:
        data.stats.find((stat) => stat.title === "Active Projects")?.value ?? 0,
      icon: ListCheck,
      tooltip: "Number of ongoing projects",
      link: "/protected/project",
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
      link: "/protected/kpi",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6">
        {/* Header + Summary Stats */}
        <Card className="sticky top-0 z-30 border-b bg-background/95 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => router.push("/protected/user")}
              >
                {" "}
                <Users className="mr-2 h-4 w-4" /> Manage Users{" "}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/protected/project")}
              >
                {" "}
                <ListCheck className="mr-2 h-4 w-4" /> View Projects{" "}
              </Button>
              <Button
                onClick={() => router.push("/protected/kpi/create")}
                className="bg-primary hover:bg-primary-dark"
              >
                {" "}
                <PlusCircle className="mr-2 h-4 w-4" /> Add KPI{" "}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleRetry}>
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh dashboard data</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle {theme === "dark" ? "light" : "dark"} theme</p>
                  </TooltipContent>
                </Tooltip>
                {process.env.NODE_ENV === "development" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDebugMode}
                      >
                        <NotebookPen className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle debug mode</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Debug View */}
        {debugMode && process.env.NODE_ENV === "development" && (
          <Card className="mt-4 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Debug: Raw Data</h3>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Stats */}
        <section className="py-6">
          {error ? (
            <Card className="border border-red-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4 font-medium">{error}</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Retry
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-6 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {summaryStats.map((stat) => (
                  <Card
                    key={stat.title}
                    className={cn(
                      "shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer",
                      stat.value === null && "border-red-200"
                    )}
                    onClick={() => stat.link && router.push(stat.link)}
                  >
                    <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                      <stat.icon className="h-10 w-10 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground font-medium">
                          {stat.title}
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p
                                className={cn(
                                  "text-2xl sm:text-3xl font-semibold",
                                  stat.value > 0
                                    ? "text-green-600"
                                    : stat.value === 0
                                      ? "text-gray-500"
                                      : "text-red-600"
                                )}
                              >
                                {stat.value !== null ? stat.value : "N/A"}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {stat.value !== null
                                  ? stat.tooltip
                                  : `Data for ${stat.title} is unavailable`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.kpis.length === 0 && data.stats.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No dashboard data available.
                      </p>
                      <Button
                        onClick={() => router.push("/protected/kpi/create")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add KPI
                      </Button>
                    </div>
                  ) : (
                    <AdminDashboard data={data} isLoading={isLoading} />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
