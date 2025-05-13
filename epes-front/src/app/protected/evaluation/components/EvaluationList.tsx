import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { EmployeeEvaluation } from "../types";

interface EvaluationListProps {
  evaluations: EmployeeEvaluation[];
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export const EvaluationList: React.FC<EvaluationListProps> = ({
  evaluations,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {evaluations.map((evalItem) => (
        <Card
          key={evalItem.employeeId}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onClick(evalItem.employeeId)}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{evalItem.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(evalItem.employeeId);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(evalItem.employeeId);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p className="text-sm">
                <span className="font-medium">Feedback Score:</span>{" "}
                {evalItem.averageFeedbackScore.toFixed(1)}
              </p>
              <p className="text-sm">
                <span className="font-medium">OKR Completion:</span>{" "}
                {evalItem.okrCompletionRate}%
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {evalItem.overallStatus}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
