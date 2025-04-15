// src/app/protected/kpi/utils/kpiUtils.ts
import jsPDF from "jspdf";
import { EmployeeKPI, ReportConfig } from "../types";

export function sortKPIs(
  kpis: EmployeeKPI[],
  sortField: keyof EmployeeKPI | null,
  sortDirection: "asc" | "desc"
): EmployeeKPI[] {
  if (!sortField) return kpis;
  return [...kpis].sort((a, b) => {
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
}

export function filterKPIs(
  kpis: EmployeeKPI[],
  searchTerm: string,
  filterStatus: "All" | "Excellent" | "Good" | "Needs Improvement"
): EmployeeKPI[] {
  return kpis.filter(
    (kpi) =>
      kpi.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "All" || kpi.status === filterStatus)
  );
}

export function exportToCSV(kpis: EmployeeKPI[]): void {
  const headers = [
    "Employee ID,Employee Name,Task Completion Rate (%),Tasks Completed,Tasks Assigned,Project Contribution (%),Projects Assigned,Performance Score,Status",
  ];
  const rows = kpis.map(
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
}

export function generatePerformanceReport(
  kpis: EmployeeKPI[],
  config: ReportConfig
): void {
  const { employeeId, period, includeTasks, includeProjects, includeComments } =
    config;
  let filteredKPIs = kpis;
  if (employeeId !== "all") {
    filteredKPIs = kpis.filter((kpi) => kpi.employeeId === employeeId);
  }

  const periodFilter = (date: string) => {
    if (date === "N/A") return true;
    const taskDate = new Date(date);
    const now = new Date();
    if (period === "last30days") {
      return taskDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "last90days") {
      return taskDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
    return true;
  };

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yOffset = margin;

  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Performance Evaluation Report", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  yOffset += 25;

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(kpi.employeeName, margin, yOffset);
    yOffset += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 10;

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

    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yOffset, 80, 8, "F");
    doc.rect(margin + 80, yOffset, 80, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Metric", margin + 2, yOffset + 6);
    doc.text("Value", margin + 82, yOffset + 6);
    yOffset += 8;

    doc.setFont("helvetica", "normal");
    metrics.forEach((metric, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 240 : 255, 255, 255);
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

  doc.save(
    `performance_report_${
      employeeId === "all"
        ? "all_employees"
        : kpis.find((k) => k.employeeId === employeeId)?.employeeName ||
          "employee"
    }_${period}.pdf`
  );
}
