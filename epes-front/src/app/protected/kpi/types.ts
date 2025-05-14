// src/app/protected/types.ts
export interface EmployeeKPI {
  employee_id: string;
  employee_name: string;
  task_completion_rate: number;
  tasks_completed: number;
  tasks_assigned: number;
  project_contribution: number;
  projects_assigned: number;
  performance_score: number;
  status: "Excellent" | "Good" | "Needs Improvement";
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    deadline?: string;
    assigned_to_id?: string;
    assigned_to?: {
      id: string;
      first_name: string;
      last_name: string;
    };
    project?: {
      id: string;
      name: string;
      status: string;
      owner?: {
        id: string;
        first_name: string;
        last_name: string;
      };
    };
  }>;
  projects?: Array<{
    id: string;
    name: string;
    status: string;
    owner?: {
      id: string;
      first_name: string;
      last_name: string;
    };
  }>;
}

export interface KPIStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ReportConfig {
  employeeId: string | "all";
  period: "last30days" | "last90days" | "allTime";
  includeTasks: boolean;
  includeProjects: boolean;
  includeComments: boolean;
}
