// src/app/protected/kpi/utils/kpiUtils.ts
import { EmployeeKPI, ReportConfig } from "../types";
import jsPDF from "jspdf";

export const sortKPIs = (
  kpis: EmployeeKPI[],
  sortField: keyof EmployeeKPI | null,
  sortDirection: "asc" | "desc"
): EmployeeKPI[] => {
  if (!sortField) return kpis;
  return [...kpis].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });
};

export const filterKPIs = (
  kpis: EmployeeKPI[],
  search: string,
  status: "All" | "Excellent" | "Good" | "Needs Improvement"
): EmployeeKPI[] => {
  let filtered = kpis;
  if (search) {
    filtered = filtered.filter((kpi) => {
      const name = kpi.employee_name ?? "";
      const kpiStatus = kpi.status ?? "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        kpiStatus.toLowerCase().includes(search.toLowerCase())
      );
    });
  }
  if (status !== "All") {
    filtered = filtered.filter((kpi) => kpi.status === status);
  }
  return filtered;
};

export const exportToCSV = (kpis: EmployeeKPI[]): void => {
  const headers = [
    "Employee",
    "Status",
    "Tasks Completed",
    "Tasks Assigned",
    "Projects Assigned",
    "Performance Score",
  ];
  const rows = kpis.map((kpi) =>
    [
      kpi.employee_name,
      kpi.status,
      kpi.tasks_completed.toString(),
      kpi.tasks_assigned.toString(),
      kpi.projects_assigned.toString(),
      kpi.performance_score.toFixed(1),
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kpis.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

export const generatePerformanceReport = (
  kpis: EmployeeKPI[],
  config: ReportConfig
): void => {
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text("Employee Performance Report", 20, 20);

  let y = 30;
  const filteredKPIs =
    config.employeeId === "all"
      ? kpis
      : kpis.filter((kpi) => kpi.employee_id === config.employeeId);

  filteredKPIs.forEach((kpi, index) => {
    pdf.setFontSize(12);
    pdf.text(`Employee: ${kpi.employee_name}`, 20, y);
    y += 10;
    pdf.text(`Status: ${kpi.status}`, 20, y);
    y += 10;
    pdf.text(`Performance Score: ${kpi.performance_score.toFixed(1)}`, 20, y);
    y += 10;

    if (config.includeTasks && kpi.tasks) {
      pdf.text("Tasks:", 20, y);
      y += 10;
      kpi.tasks.forEach((task) => {
        pdf.text(`- ${task.title} (${task.status})`, 30, y);
        y += 7;
      });
    }

    if (config.includeProjects && kpi.projects) {
      pdf.text("Projects:", 20, y);
      y += 10;
      kpi.projects.forEach((project) => {
        pdf.text(`- ${project.name} (${project.status})`, 30, y);
        y += 7;
      });
    }

    if (config.includeComments) {
      pdf.text("Comments: None", 20, y); // Placeholder
      y += 10;
    }

    if (index < filteredKPIs.length - 1) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("performance_report.pdf");
};
