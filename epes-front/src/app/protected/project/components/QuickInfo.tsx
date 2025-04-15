import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "../types";

interface QuickInfoProps {
  projects: Project[];
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

export const QuickInfo: React.FC<QuickInfoProps> = ({
  projects,
  isLoading,
  isAdmin,
  isManager,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Info</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Total Projects: {projects.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Active: {projects.filter((p) => p.status === "Active").length}
          </p>
          {(isAdmin || isManager) && (
            <p className="text-sm text-muted-foreground">
              Completed:{" "}
              {projects.filter((p) => p.status === "Completed").length}
            </p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);
