import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Add this import
import { useRouter } from "next/navigation";

interface ProjectActionsProps {
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({
  isAdmin,
  isManager,
  isLoading,
}) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {(isAdmin || isManager) && (
          <Button
            onClick={() => router.push("/protected/project/create")}
            disabled={isLoading}
          >
            Create New Project
          </Button>
        )}
        <Button
          onClick={() => router.push("/projects/active")}
          disabled={isLoading}
          variant="outline"
        >
          View Active Projects
        </Button>
        {(isAdmin || isManager) && (
          <Button
            onClick={() => router.push("/projects/all")}
            disabled={isLoading}
            variant="secondary"
          >
            View All Projects
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
