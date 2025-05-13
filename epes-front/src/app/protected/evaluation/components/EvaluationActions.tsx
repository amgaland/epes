import { Button } from "@/components/ui/button";
import { CirclePlus, FileText, Star, Users } from "lucide-react";

interface EvaluationActionsProps {
  isLoading: boolean;
  onCreate: () => void;
  onGenerateReport: () => void;
  onViewHighPerformers: () => void;
  onViewAll: () => void;
}

export const EvaluationActions: React.FC<EvaluationActionsProps> = ({
  isLoading,
  onCreate,
  onGenerateReport,
  onViewHighPerformers,
  onViewAll,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onCreate} disabled={isLoading}>
        <CirclePlus className="mr-2 h-4 w-4" />
        Create Evaluation
      </Button>
      <Button onClick={onGenerateReport} disabled={isLoading} variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        Generate Report
      </Button>
      <Button
        onClick={onViewHighPerformers}
        disabled={isLoading}
        variant="outline"
      >
        <Star className="mr-2 h-4 w-4" />
        View High Performers
      </Button>
      <Button onClick={onViewAll} disabled={isLoading} variant="outline">
        <Users className="mr-2 h-4 w-4" />
        View All Evaluations
      </Button>
    </div>
  );
};
