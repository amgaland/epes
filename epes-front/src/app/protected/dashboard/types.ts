// src/app/protected/dashboard/types.ts
import { EmployeeKPI } from "../kpi/types";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface DashboardData {
  kpis: EmployeeKPI[];
  stats: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export interface TeamFilter {
  teamId?: string;
  userId?: string;
}
