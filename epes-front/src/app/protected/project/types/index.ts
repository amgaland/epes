export interface ProjectStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Project {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Completed";
  dueDate: string;
  teamSize: number;
  progress?: number;
  teamMembers?: { user_id: string; name: string; role_in_project: string }[];
}

export type ViewMode = "table" | "grid" | "list";
export type SortDirection = "asc" | "desc";
export type FilterStatus =
  | "All"
  | "Active"
  | "Pending"
  | "Completed"
  | "My Projects";
export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface SessionUser {
  id: string;
  token: string;
  roles: Role | Role[];
}

export interface Employee {
  id: string;
  name: string;
  profileImg?: string;
}
