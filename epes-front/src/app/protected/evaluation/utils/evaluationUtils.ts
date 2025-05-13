import { saveAs } from "file-saver";
import { EmployeeEvaluation, ReportConfig } from "../types";

export const sortEvaluations = (
  evaluations: EmployeeEvaluation[],
  field: keyof EmployeeEvaluation | null,
  direction: "asc" | "desc"
): EmployeeEvaluation[] => {
  if (!field) return evaluations;

  return [...evaluations].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterEvaluations = (
  evaluations: EmployeeEvaluation[],
  searchTerm: string,
  status: "All" | "High Performing" | "Satisfactory" | "Needs Improvement"
): EmployeeEvaluation[] => {
  return evaluations.filter((evalItem) => {
    const matchesSearch = evalItem.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = status === "All" || evalItem.overallStatus === status;
    return matchesSearch && matchesStatus;
  });
};

export const exportToCSV = (evaluations: EmployeeEvaluation[]): void => {
  const headers = [
    "Employee ID",
    "Name",
    "Feedback Score",
    "OKR Completion",
    "Status",
  ];
  const csv = [
    headers.join(","),
    ...evaluations.map((evalItem) =>
      [
        evalItem.employeeId,
        `"${evalItem.name}"`,
        evalItem.averageFeedbackScore,
        evalItem.okrCompletionRate,
        evalItem.overallStatus,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "evaluations.csv");
};

export const generateEvaluationReport = (
  evaluations: EmployeeEvaluation[],
  config: ReportConfig
): void => {
  // Mock PDF generation (requires a PDF library like jsPDF)
  const reportContent = [
    `Evaluation Report - ${config.period}`,
    `Generated on: ${new Date().toLocaleDateString()}`,
    "",
    config.employeeId === "all"
      ? "All Employees"
      : `Employee: ${
          evaluations.find((e) => e.employeeId === config.employeeId)?.name
        }`,
    "",
  ];

  const filteredEvaluations =
    config.employeeId === "all"
      ? evaluations
      : evaluations.filter((e) => e.employeeId === config.employeeId);

  if (config.includeFeedback) {
    reportContent.push("360° Feedback Scores:");
    filteredEvaluations.forEach((evalItem) => {
      reportContent.push(
        `${evalItem.name}: ${evalItem.averageFeedbackScore.toFixed(1)}`
      );
    });
    reportContent.push("");
  }

  if (config.includeOKRs) {
    reportContent.push("OKR Completion Rates:");
    filteredEvaluations.forEach((evalItem) => {
      reportContent.push(`${evalItem.name}: ${evalItem.okrCompletionRate}%`);
    });
    reportContent.push("");
  }

  if (config.includeComments) {
    reportContent.push("Comments:");
    filteredEvaluations.forEach((evalItem) => {
      reportContent.push(`${evalItem.name}: (Comments not implemented)`);
    });
  }

  // For simplicity, save as text file (replace with PDF generation in production)
  const blob = new Blob([reportContent.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, "evaluation_report.txt");
};
