import { Card, CardContent } from "@/components/ui/card";
import { Evaluation } from "../types";

interface EvaluationGridProps {
  evaluations: Evaluation[];
  handleEvaluationClick: (evaluationId: string) => void;
}

export function EvaluationGrid({
  evaluations,
  handleEvaluationClick,
}: EvaluationGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evaluations.map((evaluation) => (
        <Card
          key={evaluation.id}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => handleEvaluationClick(evaluation.id)}
        >
          <CardContent className="pt-4">
            <h3 className="font-medium">{evaluation.type}</h3>
            <p className="text-sm">Employee: {evaluation.employee_id}</p>
            <p className="text-sm">Project: {evaluation.project_id || "-"}</p>
            <p className="text-sm">Task: {evaluation.task_id || "-"}</p>
            <p className="text-sm">
              Value:{" "}
              {typeof evaluation.value === "string"
                ? evaluation.value.slice(0, 50)
                : evaluation.value}
            </p>
            <p className="text-sm">Date: {evaluation.date}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
