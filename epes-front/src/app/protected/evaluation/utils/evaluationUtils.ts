import { Evaluation } from "../types";

export const sortEvaluations = (
  evaluations: Evaluation[],
  field: keyof Evaluation | null,
  direction: "asc" | "desc"
) => {
  if (!field) return evaluations;
  return [...evaluations].sort((a, b) => {
    const aValue = a[field] ?? "";
    const bValue = b[field] ?? "";
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterEvaluations = (
  evaluations: Evaluation[],
  searchTerm: string,
  filterType: "All" | "KPI" | "OKR" | "Feedback" | "My Evaluations",
  userId: string
) => {
  return evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.employee_id.includes(searchTerm) ||
      evaluation.project_id?.includes(searchTerm) ||
      false ||
      evaluation.task_id?.includes(searchTerm) ||
      false ||
      evaluation.description?.includes(searchTerm) ||
      false ||
      (typeof evaluation.value === "string" &&
        evaluation.value.includes(searchTerm));
    const matchesType =
      filterType === "All" ||
      (filterType === "KPI" && evaluation.type === "KPI") ||
      (filterType === "OKR" && evaluation.type === "OKR") ||
      (filterType === "Feedback" && evaluation.type === "Feedback") ||
      (filterType === "My Evaluations" && evaluation.employee_id === userId);
    return matchesSearch && matchesType;
  });
};

export const exportToCSV = (evaluations: Evaluation[]) => {
  const headers = [
    "ID,Employee ID,Project ID,Task ID,Type,Value,Description,Date",
  ];
  const rows = evaluations.map(
    (evaluation) =>
      `${evaluation.id},${evaluation.employee_id},${
        evaluation.project_id || ""
      },${evaluation.task_id || ""},${evaluation.type},${evaluation.value},${
        evaluation.description || ""
      },${evaluation.date}`
  );
  const csv = [...headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "evaluations.csv";
  a.click();
  URL.revokeObjectURL(url);
};
