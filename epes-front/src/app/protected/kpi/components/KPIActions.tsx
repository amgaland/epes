// src/app/protected/kpi/components/KPIActions.tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface KPIActionsProps {
  isLoading: boolean;
  onCreate: () => void;
  onGenerateReport: () => void;
  onViewExcellent: () => void;
  onViewAll: () => void;
}

export function KPIActions({
  isLoading,
  onCreate,
  onGenerateReport,
  onViewExcellent,
  onViewAll,
}: KPIActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button onClick={onCreate} disabled={isLoading}>
          Create KPI
        </Button>
        <Button onClick={onGenerateReport} disabled={isLoading}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Performance Report
        </Button>
        <Button
          onClick={onViewExcellent}
          disabled={isLoading}
          variant="outline"
        >
          View Excellent Performers
        </Button>
        <Button onClick={onViewAll} disabled={isLoading} variant="secondary">
          View All KPIs
        </Button>
      </CardContent>
    </Card>
  );
}
