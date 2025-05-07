// kpiService.ts
import { EmployeeKPI } from "../types";

export const fetchEmployeeKPIs = async (
  employeeId: string,
  token: string
): Promise<EmployeeKPI> => {
  const res = await fetch(`/api/kpis/employee/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employee KPI");
  }

  const data = await res.json();
  return data.data;
};
