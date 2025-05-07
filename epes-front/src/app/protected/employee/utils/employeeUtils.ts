import { Employee } from "../types";

export const sortEmployees = (
  employees: Employee[],
  field: keyof Employee | null,
  direction: "asc" | "desc"
) => {
  if (!field) return employees;
  return [...employees].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterEmployees = (
  employees: Employee[],
  searchTerm: string,
  filterRole: "All" | "Employee" | "Manager" | "Admin",
  filterStatus: "All" | "Active" | "Inactive"
) => {
  let filtered = employees;
  if (searchTerm) {
    filtered = filtered.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        e.loginID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.emailWork.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.projects.some((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        e.tasks.some((t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }
  if (filterRole !== "All") {
    filtered = filtered.filter((e) => e.role === filterRole);
  }
  if (filterStatus !== "All") {
    filtered = filtered.filter((e) => e.status === filterStatus);
  }
  return filtered;
};

export const exportToCSV = (employees: Employee[]) => {
  const headers = [
    "ID,First Name,Last Name,Login ID,Email,Role,Status,Projects,Tasks,Feedback",
  ];
  const rows = employees.map((e) => [
    e.id,
    e.firstName,
    e.lastName,
    e.loginID,
    e.emailWork,
    e.role,
    e.status,
    e.projects.map((p) => p.name).join(";"),
    e.tasks.map((t) => t.title).join(";"),
    e.feedback
      .map((f) => `${f.text} (by ${f.author} on ${f.createdAt})`)
      .join(";"),
  ]);
  const csv = [
    headers,
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employees.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};
