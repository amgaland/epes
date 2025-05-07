import { Project, SortDirection } from "../types";

export const sortProjects = (
  projects: Project[],
  sortField: keyof Project | null,
  sortDirection: SortDirection
): Project[] => {
  if (!sortField) return projects;

  return [...projects].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || bValue === undefined) return 0;

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

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

export const filterProjects = (
  projects: Project[],
  searchTerm: string,
  filterStatus: "All" | "Active" | "Pending" | "Completed" | "My Projects",
  userId?: string
): Project[] => {
  let filtered = projects;

  // Apply status filter
  if (filterStatus !== "All") {
    if (filterStatus === "My Projects") {
      if (userId) {
        filtered = filtered.filter((project) =>
          project.teamMembers?.some((member) => member.user_id === userId)
        );
      }
    } else {
      filtered = filtered.filter((project) => project.status === filterStatus);
    }
  }

  // Apply search filter
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filtered = filtered.filter((project) =>
      project.name.toLowerCase().includes(lowerSearch)
    );
  }

  return filtered;
};

export const exportToCSV = (projects: Project[]) => {
  const headers = ["ID,Name,Status,Due Date,Team Size,Progress"];
  const rows = projects.map(
    (p) =>
      `${p.id},${p.name},${p.status},${p.dueDate},${p.teamSize},${p.progress || "N/A"}`
  );
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "projects.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
