// src/app/protected/dashboard/components/AdminDashboard.tsx
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CirclePlus, Download } from "lucide-react";
import { KPIStats } from "../../kpi/components/KPIStats";
import { KPITable } from "../../kpi/components/KPITable";
import { KPIChart } from "./KPIChart";
import { DashboardData } from "../types";
import { exportToCSV } from "../../kpi/utils/kpiUtils";
import { getPerformanceChartData } from "../utils/dashboardUtils";

interface AdminDashboardProps {
  data: DashboardData;
  isLoading: boolean;
}

export function AdminDashboard({ data, isLoading }: AdminDashboardProps) {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/protected/kpi/create")}>
            <CirclePlus className="mr-2 h-4 w-4" />
            Create KPI
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToCSV(data.kpis)}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <KPIStats stats={data.stats} isLoading={isLoading} />

      <KPIChart data={getPerformanceChartData(data.kpis)} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Employee KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <KPITable
            kpis={data.kpis}
            onSort={() => {}} // Sorting can be added if needed
            onClick={(id) => router.push(`/protected/kpi/employee/${id}`)}
            onEdit={(id) => router.push(`/protected/kpi/edit/${id}`)}
            onDelete={() => {}} // Deletion can be added with dialog
          />
        </CardContent>
      </Card>
    </div>
  );
}
