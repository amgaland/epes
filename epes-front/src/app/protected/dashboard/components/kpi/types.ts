export interface EmployeeKPI {
  employeeId: string;
  employeeName: string;
  tasksCompleted: number;
  tasksAssigned: number;
  taskCompletionRate: number;
  projectsAssigned: number;
  projectContribution: number;
  performanceScore: number;
  status: "Excellent" | "Good" | "Needs Improvement";
}
