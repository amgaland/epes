// src/app/protected/kpi/components/KPIActions.tsx
import { Button } from "@/components/ui/button";
import { CirclePlus, FileText, Star, List } from "lucide-react";

interface KPIActionsProps {
  isLoading: boolean;
  onCreate: () => void;
  onGenerateReport: () => void;
  onViewExcellent: () => void;
  onViewAll: () => void;
}

export const KPIActions: React.FC<KPIActionsProps> = ({
  isLoading,
  onCreate,
  onGenerateReport,
  onViewExcellent,
  onViewAll,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onCreate} disabled={isLoading}>
        <CirclePlus className="mr-2 h-4 w-4" />
        Create KPI
      </Button>
      <Button onClick={onGenerateReport} disabled={isLoading}>
        <FileText className="mr-2 h-4 w-4" />
        Generate Report
      </Button>
      <Button onClick={onViewExcellent} disabled={isLoading}>
        <Star className="mr-2 h-4 w-4" />
        View Excellent Performers
      </Button>
      <Button onClick={onViewAll} disabled={isLoading}>
        <List className="mr-2 h-4 w-4" />
        View All KPIs
      </Button>
    </div>
  );
};
