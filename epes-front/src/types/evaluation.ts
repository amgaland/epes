export interface KPI {
  target: string;
  achieved: number;
  status: "on-track" | "behind" | "completed";
}

export interface OKR {
  objective: string;
  keyResults: string[];
  progress: number; // 0-100%
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  kpi: KPI;
  okr: OKR;
  feedback: string[];
}

export interface Evaluations {
  employees: Employee[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
