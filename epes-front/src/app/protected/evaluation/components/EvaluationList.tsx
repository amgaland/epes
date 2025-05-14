import { Evaluation } from "../types";

interface EvaluationListProps {
  evaluations: Evaluation[];
  handleEvaluationClick: (evaluationId: string) => void;
}

export function EvaluationList({
  evaluations,
  handleEvaluationClick,
}: EvaluationListProps) {
  return (
    <ul className="space-y-2">
      {evaluations.map((evaluation) => (
        <li
          key={evaluation.id}
          className="cursor-pointer hover:bg-muted/50 p-2 rounded"
          onClick={() => handleEvaluationClick(evaluation.id)}
        >
          <span className="font-medium">{evaluation.type}</span> - Employee:{" "}
          {evaluation.employee_id}, Project: {evaluation.project_id || "-"},
          Task: {evaluation.task_id || "-"}, Value:{" "}
          {typeof evaluation.value === "string"
            ? evaluation.value.slice(0, 50)
            : evaluation.value}
          , Date: {evaluation.date}
        </li>
      ))}
    </ul>
  );
}
