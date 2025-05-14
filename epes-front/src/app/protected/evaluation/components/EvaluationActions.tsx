import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EvaluationActionsProps {
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
}

export function EvaluationActions({
  isAdmin,
  isManager,
  isLoading,
}: EvaluationActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {(isAdmin || isManager) && (
          <>
            <Button disabled={isLoading}>Generate Report</Button>
            <Button disabled={isLoading}>Update Task Completion</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
