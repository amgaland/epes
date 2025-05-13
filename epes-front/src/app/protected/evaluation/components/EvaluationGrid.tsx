import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { EmployeeEvaluation } from "../types";

interface EvaluationGridProps {
  evaluations: EmployeeEvaluation[];
  onClick: (employeeId: string) => void;
  onEdit: (employeeId: string) => void;
  onDelete: (employeeId: string) => void;
}

export const EvaluationGrid: React.FC<EvaluationGridProps> = ({
  evaluations,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evaluations.map((evalItem) => (
        <Card
          key={evalItem.employeeId}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onClick(evalItem.employeeId)}
        >
          <CardHeader>
            <CardTitle>{evalItem.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
          <CardFooter className="flex justify-end gap-2">
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
