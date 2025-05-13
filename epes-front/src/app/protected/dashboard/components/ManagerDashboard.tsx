// src/app/protected/dashboard/components/ManagerDashboard.tsx
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIStats } from "../../evaluation/components/KPIStats";
import { KPITable } from "../../evaluation/components/KPITable";
import { KPIChart } from "./KPIChart";
import { DashboardData } from "../types";
import { getPerformanceChartData } from "../utils/dashboardUtils";

interface ManagerDashboardProps {
  data: DashboardData;
  isLoading: boolean;
}

export function ManagerDashboard({ data, isLoading }: ManagerDashboardProps) {
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      <KPIStats stats={data.stats} isLoading={isLoading} />

      <KPIChart data={getPerformanceChartData(data.kpis)} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Team KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <KPITable
            kpis={data.kpis}
            onSort={() => {}} // Sorting can be added
            onClick={(id) => router.push(`/protected/kpi/employee/${id}`)}
            onEdit={() => {}} // Managers can't edit
            onDelete={() => {}} // Managers can't delete
          />
        </CardContent>
      </Card>
    </div>
  );
}
