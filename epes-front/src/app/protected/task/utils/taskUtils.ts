// src/app/protected/task/utils/taskUtils.ts
import { Task } from "../types";

export function sortTasks(
  tasks: Task[],
  sortField: keyof Task | null,
  sortDirection: "asc" | "desc"
): Task[] {
  if (!sortField) return tasks;
  return [...tasks].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "assignedTo") {
      aValue = a.assignedTo
        ? `${a.assignedTo.first_name} ${a.assignedTo.last_name}`.toLowerCase()
        : "";
      bValue = b.assignedTo
        ? `${b.assignedTo.first_name} ${b.assignedTo.last_name}`.toLowerCase()
        : "";
    } else {
      aValue = aValue || "";
      bValue = bValue || "";
    }

    if (sortField === "dueDate") {
      const aDate =
        aValue === "N/A" ? Infinity : new Date(aValue as string).getTime();
      const bDate =
        bValue === "N/A" ? Infinity : new Date(bValue as string).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });
}

export function filterTasks(
  tasks: Task[],
  searchTerm: string,
  filterStatus: "All" | "Pending" | "In Progress" | "Completed"
): Task[] {
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) &&
      (filterStatus === "All" || task.status === filterStatus)
  );
}

export function exportToCSV(tasks: Task[]) {
  const headers = ["ID,Title,Status,Due Date,Assigned To,Priority"];
  const rows = tasks.map(
    (t) =>
      `${t.id},${t.title},${t.status},${t.dueDate},${
        t.assignedTo
          ? `${t.assignedTo.first_name} ${t.assignedTo.last_name}`.trim()
          : "Unassigned"
      },${t.priority}`
  );
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "tasks.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
