export interface User {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
  assignedTo: User | null;
  priority: "Low" | "Medium" | "High";
  project: Project | null;
  comment: string | null;
  updated_by: string | null; // UUID, not first_name
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: "Pending" | "In Progress" | "Completed";
  deadline: string | null;
  assigned_to: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  priority: "Low" | "Medium" | "High";
  project_id: string | null;
  comment: string | null;
  updated_by: string | null; // UUID, not first_name
}

export interface TaskForm {
  project_id: string;
  title: string;
  description: string;
  assigned_to_id: string;
  status: "Pending" | "In Progress" | "Completed";
  deadline: string;
  completed_at: string;
}

export interface FormErrors {
  project_id?: string;
  title?: string;
  status?: string;
  deadline?: string;
  completed_at?: string;
}

export interface TaskStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TaskPayload {
  project_id: string;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed";
  assigned_to_id?: string;
  deadline?: string;
  completed_at?: string;
}
