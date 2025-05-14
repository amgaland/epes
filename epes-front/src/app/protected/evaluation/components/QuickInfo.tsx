import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Evaluation } from "../types";

interface QuickInfoProps {
  evaluations: Evaluation[];
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

export function QuickInfo({
  evaluations,
  isLoading,
  isAdmin,
  isManager,
}: QuickInfoProps) {
  const recentEvaluations = evaluations
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Evaluations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        ) : recentEvaluations.length === 0 ? (
          <p className="text-muted-foreground">No recent evaluations.</p>
        ) : (
          <ul className="space-y-2">
            {recentEvaluations.map((evaluation) => (
              <li key={evaluation.id} className="text-sm">
                <span className="font-medium">{evaluation.type}</span> for
                Employee {evaluation.employee_id}
                {evaluation.project_id &&
                  ` (Project: ${evaluation.project_id})`}
                {evaluation.task_id && ` (Task: ${evaluation.task_id})`}:{" "}
                {typeof evaluation.value === "string"
                  ? evaluation.value.slice(0, 30)
                  : evaluation.value}
                {(isAdmin || isManager) && ` (${evaluation.date})`}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
