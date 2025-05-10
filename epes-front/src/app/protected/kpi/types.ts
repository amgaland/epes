// src/app/protected/kpi/types.ts
export interface EmployeeKPI {
  employeeId: string;
  employeeName: string;
  taskCompletionRate: number;
  tasksCompleted: number;
  tasksAssigned: number;
  projectContribution: number;
  projectsAssigned: number;
  performanceScore: number;
  status: "Excellent" | "Good" | "Needs Improvement";
  tasks: { id: string; title: string; status: string; dueDate: string }[];
  projects: { id: string; name: string; progress: number }[];
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
