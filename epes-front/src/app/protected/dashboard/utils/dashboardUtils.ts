// src/app/protected/dashboard/utils/dashboardUtils.ts
import { EmployeeKPI } from "../../evaluation/types";

export function getPerformanceChartData(kpis: EmployeeKPI[]) {
  return kpis.map((kpi) => ({
    name: kpi.employeeName,
    score: kpi.performanceScore,
    tasks: kpi.taskCompletionRate,
    projects: kpi.projectContribution,
  }));
}

export function getStatusDistribution(kpis: EmployeeKPI[]) {
  const counts = {
    Excellent: 0,
    Good: 0,
    "Needs Improvement": 0,
  };
  kpis.forEach((kpi) => {
    counts[kpi.status]++;
  });
  return [
    { name: "Excellent", value: counts.Excellent },
    { name: "Good", value: counts.Good },
    { name: "Needs Improvement", value: counts["Needs Improvement"] },
  ];
}
