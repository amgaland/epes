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
  BarChart,
  CheckCircle,
  Clock,
  Users,
  Search,
  CirclePlus,
  LayoutGrid,
  List,
  Table as TableIcon,
  ArrowUpDown,
  Download,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";

interface KPIStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

interface EmployeeKPI {
  employeeId: string;
  employeeName: string;
  taskCompletionRate: number;
  tasksCompleted: number;
  tasksAssigned: number;
  projectContribution: number;
  projectsAssigned: number;
  performanceScore: number;
  status: "Excellent" | "Good" | "Needs Improvement";
  tasks?: { id: string; title: string; status: string; dueDate: string }[];
  projects?: { id: string; name: string; progress: number }[];
}

interface ReportConfig {
  employeeId: string | "all";
  period: "last30days" | "last90days" | "allTime";
  includeTasks: boolean;
  includeProjects: boolean;
  includeComments: boolean;
}

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
    const fetchEmployeeKPIs = async () => {
      if (!session?.user?.token) {
        console.error("No token available in session:", session);
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

        // Fetch tasks and projects
        const [tasksResponse, projectsResponse] = await Promise.all([
          req.GET("/protected/tasks", session.user.token),
          req.GET("/protected/projects", session.user.token),
        ]);

        // Process tasks
        const tasks = tasksResponse.map((t: any) => ({
          id: t.id,
          title: t.title,
          assignedTo: t.assigned_to?.id || null,
          status: t.status,
          dueDate: t.deadline
            ? new Date(t.deadline).toISOString().split("T")[0]
            : "N/A",
          firstName: t.assigned_to?.first_name || "Unassigned",
          lastName: t.assigned_to?.last_name || "",
        }));

        // Process projects
        const projects = projectsResponse.map((p: any) => ({
          id: p.id,
          name: p.name,
          teamMembers: p.team_members || [],
          progress: p.progress || 0,
        }));

        // Aggregate KPIs by employee
        const employeeMap: {
          [key: string]: {
            employeeId: string;
            employeeName: string;
            tasksCompleted: number;
            tasksAssigned: number;
            projectContributions: number[];
            projectsAssigned: number;
            tasks: {
              id: string;
              title: string;
              status: string;
              dueDate: string;
            }[];
            projects: { id: string; name: string; progress: number }[];
          };
        } = {};

        // Aggregate task data
        tasks.forEach((task: any) => {
          if (task.assignedTo) {
            if (!employeeMap[task.assignedTo]) {
              employeeMap[task.assignedTo] = {
                employeeId: task.assignedTo,
                employeeName: `${task.firstName} ${task.lastName}`.trim(),
                tasksCompleted: 0,
                tasksAssigned: 0,
                projectContributions: [],
                projectsAssigned: 0,
                tasks: [],
                projects: [],
              };
            }
            employeeMap[task.assignedTo].tasksAssigned += 1;
            employeeMap[task.assignedTo].tasks.push({
              id: task.id,
              title: task.title,
              status: task.status,
              dueDate: task.dueDate,
            });
            if (
              task.status === "Completed" &&
              (task.dueDate === "N/A" || new Date(task.dueDate) >= new Date())
            ) {
              employeeMap[task.assignedTo].tasksCompleted += 1;
            }
          }
        });

        // Aggregate project data
        projects.forEach((project: any) => {
          project.teamMembers.forEach((member: any) => {
            if (!employeeMap[member.user_id]) {
              employeeMap[member.user_id] = {
                employeeId: member.user_id,
                employeeName: member.name || "Unknown",
                tasksCompleted: 0,
                tasksAssigned: 0,
                projectContributions: [],
                projectsAssigned: 0,
                tasks: [],
                projects: [],
              };
            }
            employeeMap[member.user_id].projectsAssigned += 1;
            employeeMap[member.user_id].projects.push({
              id: project.id,
              name: project.name,
              progress: project.progress,
            });
            const contribution =
              project.progress / (project.teamMembers.length || 1);
            employeeMap[member.user_id].projectContributions.push(contribution);
          });
        });

        // Calculate KPIs
        const mappedKPIs: EmployeeKPI[] = Object.values(employeeMap).map(
          (emp) => {
            const taskCompletionRate =
              emp.tasksAssigned > 0
                ? (emp.tasksCompleted / emp.tasksAssigned) * 100
                : 0;
            const projectContribution =
              emp.projectContributions.length > 0
                ? emp.projectContributions.reduce((a, b) => a + b, 0) /
                  emp.projectContributions.length
                : 0;
            const performanceScore =
              0.6 * taskCompletionRate + 0.4 * projectContribution;
            let status: "Excellent" | "Good" | "Needs Improvement" =
              "Needs Improvement";
            if (performanceScore >= 80) status = "Excellent";
            else if (performanceScore >= 50) status = "Good";

            return {
              employeeId: emp.employeeId,
              employeeName: emp.employeeName,
              taskCompletionRate: Math.round(taskCompletionRate),
              tasksCompleted: emp.tasksCompleted,
              tasksAssigned: emp.tasksAssigned,
              projectContribution: Math.round(projectContribution),
              projectsAssigned: emp.projectsAssigned,
              performanceScore: Math.round(performanceScore),
              status,
              tasks: emp.tasks,
              projects: emp.projects,
            };
          }
        );

        setKPIs(mappedKPIs);

        // Calculate stats
        const excellentPerformers = mappedKPIs.filter(
          (k) => k.status === "Excellent"
        ).length;
        const goodPerformers = mappedKPIs.filter(
          (k) => k.status === "Good"
        ).length;
        const needsImprovement = mappedKPIs.filter(
          (k) => k.status === "Needs Improvement"
        ).length;
        const avgPerformanceScore =
          mappedKPIs.length > 0
            ? Math.round(
                mappedKPIs.reduce((sum, k) => sum + k.performanceScore, 0) /
                  mappedKPIs.length
              )
            : 0;

        setStats([
          {
            title: "Excellent Performers",
            value: excellentPerformers,
            icon: CheckCircle,
          },
          { title: "Good Performers", value: goodPerformers, icon: Users },
          {
            title: "Needs Improvement",
            value: needsImprovement,
            icon: Clock,
          },
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
      fetchEmployeeKPIs();
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
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const handleSort = (e: React.MouseEvent, field: keyof EmployeeKPI) => {
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
      await req.DELETE(
        `/protected/kpi/${employeeToDelete}`,
        session.user.token
      );
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

  const openDeleteDialog = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const generatePerformanceReport = () => {
    const {
      employeeId,
      period,
      includeTasks,
      includeProjects,
      includeComments,
    } = reportConfig;

    let filteredKPIs = kpis;
    if (employeeId !== "all") {
      filteredKPIs = kpis.filter((kpi) => kpi.employeeId === employeeId);
    }

    // Filter by period
    const now = new Date();
    const periodFilter = (date: string) => {
      if (date === "N/A") return true;
      const taskDate = new Date(date);
      if (period === "last30days") {
        return taskDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (period === "last90days") {
        return taskDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      }
      return true;
    };

    // Initialize jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yOffset = margin;

    // Header
    doc.setFillColor(0, 102, 204); // Blue header background
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Performance Evaluation Report", pageWidth / 2, 20, {
      align: "center",
    });

    // Reset text color and font for body
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    yOffset += 25;

    // Metadata
    doc.setFont("helvetica", "italic");
    doc.text(
      `Generated on: ${new Date().toISOString().split("T")[0]}`,
      margin,
      yOffset
    );
    yOffset += 5;
    doc.text(
      `Period: ${
        period === "allTime"
          ? "All Time"
          : period === "last30days"
            ? "Last 30 Days"
            : "Last 90 Days"
      }`,
      margin,
      yOffset
    );
    yOffset += 10;

    filteredKPIs.forEach((kpi, index) => {
      if (yOffset > 260) {
        doc.addPage();
        yOffset = margin;
      }

      // Employee Section Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(kpi.employeeName, margin, yOffset);
      yOffset += 5;
      doc.setLineWidth(0.5);
      doc.line(margin, yOffset, pageWidth - margin, yOffset); // Section divider
      yOffset += 10;

      // KPI Metrics Table
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const metrics = [
        { label: "Performance Score", value: `${kpi.performanceScore}` },
        { label: "Status", value: kpi.status },
        { label: "Task Completion Rate", value: `${kpi.taskCompletionRate}%` },
        {
          label: "Tasks Completed",
          value: `${kpi.tasksCompleted}/${kpi.tasksAssigned}`,
        },
        { label: "Project Contribution", value: `${kpi.projectContribution}%` },
        { label: "Projects Assigned", value: `${kpi.projectsAssigned}` },
      ];

      // Draw table headers
      doc.setFillColor(230, 230, 230); // Light grey for header
      doc.rect(margin, yOffset, 80, 8, "F");
      doc.rect(margin + 80, yOffset, 80, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Metric", margin + 2, yOffset + 6);
      doc.text("Value", margin + 82, yOffset + 6);
      yOffset += 8;

      // Draw table rows
      doc.setFont("helvetica", "normal");
      metrics.forEach((metric, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 240 : 255, 255, 255); // Alternate row colors
        doc.rect(margin, yOffset, 80, 8, "F");
        doc.rect(margin + 80, yOffset, 80, 8, "F");
        doc.text(metric.label, margin + 2, yOffset + 6);
        doc.text(metric.value, margin + 82, yOffset + 6);
        yOffset += 8;
      });
      yOffset += 10;

      if (includeTasks && kpi.tasks) {
        doc.setFont("helvetica", "bold");
        doc.text("Tasks", margin, yOffset);
        yOffset += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 5;
        doc.setFont("helvetica", "normal");
        const filteredTasks = kpi.tasks.filter((task) =>
          periodFilter(task.dueDate)
        );
        filteredTasks.forEach((task) => {
          if (yOffset > 260) {
            doc.addPage();
            yOffset = margin;
          }
          const taskText = `${task.title} (Status: ${task.status}, Due: ${task.dueDate})`;
          const splitText = doc.splitTextToSize(
            taskText,
            pageWidth - 2 * margin - 5
          );
          doc.text(splitText, margin + 5, yOffset);
          yOffset += splitText.length * 6 + 2;
        });
        yOffset += 5;
      }

      if (includeProjects && kpi.projects) {
        doc.setFont("helvetica", "bold");
        doc.text("Projects", margin, yOffset);
        yOffset += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 5;
        doc.setFont("helvetica", "normal");
        kpi.projects.forEach((project) => {
          if (yOffset > 260) {
            doc.addPage();
            yOffset = margin;
          }
          const projectText = `${project.name} (Progress: ${project.progress}%)`;
          const splitText = doc.splitTextToSize(
            projectText,
            pageWidth - 2 * margin - 5
          );
          doc.text(splitText, margin + 5, yOffset);
          yOffset += splitText.length * 6 + 2;
        });
        yOffset += 5;
      }

      if (includeComments) {
        doc.setFont("helvetica", "bold");
        doc.text("Comments", margin, yOffset);
        yOffset += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 5;
        doc.setFont("helvetica", "normal");
        const comment =
          kpi.status === "Excellent"
            ? "Outstanding performance with consistent task completion and significant project contributions."
            : kpi.status === "Good"
              ? "Solid performance, meeting expectations in tasks and projects."
              : "Improvement needed in task completion and/or project contributions.";
        const splitComment = doc.splitTextToSize(
          comment,
          pageWidth - 2 * margin - 5
        );
        doc.text(splitComment, margin + 5, yOffset);
        yOffset += splitComment.length * 6 + 5;
      }

      if (index < filteredKPIs.length - 1) {
        yOffset += 10;
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    // Save PDF
    doc.save(
      `performance_report_${
        employeeId === "all"
          ? "all_employees"
          : kpis.find((k) => k.employeeId === employeeId)?.employeeName ||
            "employee"
      }_${period}.pdf`
    );

    toast({
      title: "Success",
      description: "Performance report generated successfully as PDF.",
    });
    setReportDialogOpen(false);
  };

  const sortedKPIs = [...kpis].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === "employeeName") {
      return sortDirection === "asc"
        ? typeof aValue === "string" && typeof bValue === "string"
          ? aValue.localeCompare(bValue)
          : 0
        : typeof aValue === "string" && typeof bValue === "string"
          ? bValue.localeCompare(aValue)
          : 0;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const filteredKPIs = sortedKPIs.filter(
    (kpi) =>
      kpi.employeeName.toLowerCase().includes(searchTerm) &&
      (filterStatus === "All" || kpi.status === filterStatus)
  );

  const exportToCSV = () => {
    const headers = [
      "Employee ID,Employee Name,Task Completion Rate (%),Tasks Completed,Tasks Assigned,Project Contribution (%),Projects Assigned,Performance Score,Status",
    ];
    const rows = filteredKPIs.map(
      (k) =>
        `${k.employeeId},${k.employeeName},${k.taskCompletionRate},${k.tasksCompleted},${k.tasksAssigned},${k.projectContribution},${k.projectsAssigned},${k.performanceScore},${k.status}`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "employee_kpis.csv");
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
            onClick={(e) => handleSort(e, "employeeName")}
          >
            Employee Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={(e) => handleSort(e, "taskCompletionRate")}
          >
            Task Completion (%) <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={(e) => handleSort(e, "tasksCompleted")}
          >
            Tasks Completed <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={(e) => handleSort(e, "projectContribution")}
          >
            Project Contribution (%){" "}
            <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={(e) => handleSort(e, "projectsAssigned")}
          >
            Projects Assigned <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={(e) => handleSort(e, "performanceScore")}
          >
            Performance Score <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={(e) => handleSort(e, "status")}
          >
            Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredKPIs.length > 0 ? (
          filteredKPIs.map((kpi) => (
            <TableRow
              key={kpi.employeeId}
              onClick={() => handleKPIClick(kpi.employeeId)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell className="font-medium">{kpi.employeeName}</TableCell>
              <TableCell>{kpi.taskCompletionRate}%</TableCell>
              <TableCell>{kpi.tasksCompleted}</TableCell>
              <TableCell>{kpi.projectContribution}%</TableCell>
              <TableCell>{kpi.projectsAssigned}</TableCell>
              <TableCell>{kpi.performanceScore}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    kpi.status === "Excellent"
                      ? "secondary"
                      : kpi.status === "Good"
                        ? "default"
                        : "outline"
                  }
                >
                  {kpi.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditKPI(kpi.employeeId);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(kpi.employeeId);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              No employee KPIs found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  // Render Grid View
  const renderGridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredKPIs.length > 0 ? (
        filteredKPIs.map((kpi) => (
          <TooltipProvider key={kpi.employeeId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => handleKPIClick(kpi.employeeId)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {kpi.employeeName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge
                        variant={
                          kpi.status === "Excellent"
                            ? "secondary"
                            : kpi.status === "Good"
                              ? "default"
                              : "outline"
                        }
                      >
                        {kpi.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Task Completion: {kpi.taskCompletionRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tasks: {kpi.tasksCompleted}/{kpi.tasksAssigned}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Project Contribution: {kpi.projectContribution}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Projects: {kpi.projectsAssigned}
                      </p>
                      <Progress value={kpi.performanceScore} />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditKPI(kpi.employeeId);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(kpi.employeeId);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Employee: {kpi.employeeName}</p>
                <p>Performance Score: {kpi.performanceScore}</p>
                <p>Tasks Completed: {kpi.tasksCompleted}</p>
                <p>Projects Assigned: {kpi.projectsAssigned}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      ) : (
        <p className="text-center col-span-full">No employee KPIs found.</p>
      )}
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {filteredKPIs.length > 0 ? (
        filteredKPIs.map((kpi) => (
          <TooltipProvider key={kpi.employeeId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => handleKPIClick(kpi.employeeId)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">
                        {kpi.employeeName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tasks: {kpi.tasksCompleted}/{kpi.tasksAssigned} |
                        Projects: {kpi.projectsAssigned}
                      </p>
                      <Progress
                        value={kpi.performanceScore}
                        className="w-[200px]"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          kpi.status === "Excellent"
                            ? "secondary"
                            : kpi.status === "Good"
                              ? "default"
                              : "outline"
                        }
                      >
                        {kpi.status}
                      </Badge>
                      <p className="text-sm font-medium">
                        Score: {kpi.performanceScore}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditKPI(kpi.employeeId);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(kpi.employeeId);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Employee: {kpi.employeeName}</p>
                <p>Performance Score: {kpi.performanceScore}</p>
                <p>Tasks Completed: {kpi.tasksCompleted}</p>
                <p>Projects Assigned: {kpi.projectsAssigned}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))
      ) : (
        <p className="text-center">No employee KPIs found.</p>
      )}
    </div>
  );

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
          <Button variant="outline" onClick={exportToCSV} disabled={isLoading}>
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

          {/* KPI Stats */}
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

          {/* KPI Actions and Quick Info */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>KPI Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => router.push("/protected/kpi/create")}
                  disabled={isLoading}
                >
                  Create KPI
                </Button>
                <Button
                  onClick={() => setReportDialogOpen(true)}
                  disabled={isLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Performance Report
                </Button>
                <Button
                  onClick={() => router.push("/protected/kpi/excellent")}
                  disabled={isLoading}
                  variant="outline"
                >
                  View Excellent Performers
                </Button>
                <Button
                  onClick={() => router.push("/protected/kpi/all")}
                  disabled={isLoading}
                  variant="secondary"
                >
                  View All KPIs
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
                            kpis.reduce(
                              (sum, k) => sum + k.performanceScore,
                              0
                            ) / kpis.length
                          )
                        : 0}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* KPI List with View Modes */}
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
                  {viewMode === "table" && renderTableView()}
                  {viewMode === "grid" && renderGridView()}
                  {viewMode === "list" && renderListView()}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this KPI record? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteKPI}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Performance Report</DialogTitle>
            <DialogDescription>
              Configure the performance evaluation report settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee-select">Employee</Label>
              <Select
                value={reportConfig.employeeId}
                onValueChange={(value) =>
                  setReportConfig({ ...reportConfig, employeeId: value })
                }
              >
                <SelectTrigger id="employee-select">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {kpis.map((kpi) => (
                    <SelectItem key={kpi.employeeId} value={kpi.employeeId}>
                      {kpi.employeeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period-select">Time Period</Label>
              <Select
                value={reportConfig.period}
                onValueChange={(value) =>
                  setReportConfig({
                    ...reportConfig,
                    period: value as ReportConfig["period"],
                  })
                }
              >
                <SelectTrigger id="period-select">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-tasks"
                  checked={reportConfig.includeTasks}
                  onChange={(e) =>
                    setReportConfig({
                      ...reportConfig,
                      includeTasks: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="include-tasks">Include Task Details</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-projects"
                  checked={reportConfig.includeProjects}
                  onChange={(e) =>
                    setReportConfig({
                      ...reportConfig,
                      includeProjects: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="include-projects">
                  Include Project Details
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-comments"
                  checked={reportConfig.includeComments}
                  onChange={(e) =>
                    setReportConfig({
                      ...reportConfig,
                      includeComments: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="include-comments">
                  Employee Performance Comments
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={generatePerformanceReport}>
              Generate PDF Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KPIPage;
