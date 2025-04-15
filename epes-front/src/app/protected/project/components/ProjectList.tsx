import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project } from "../types";

interface ProjectListProps {
  projects: Project[];
  handleProjectClick: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  handleProjectClick,
}) => (
  <div className="space-y-4">
    {projects.length > 0 ? (
      projects.map((project) => (
        <TooltipProvider key={project.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                onClick={() => handleProjectClick(project.id)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Due: {project.dueDate} | Team: {project.teamSize}
                    </p>
                    <Progress
                      value={project.progress || 0}
                      className="w-[200px]"
                    />
                  </div>
                  <Badge
                    variant={
                      project.status === "Active"
                        ? "default"
                        : project.status === "Completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Team Members:</p>
              <ul>
                {project.teamMembers?.map((member) => (
                  <li key={member.user_id}>
                    {member.name} ({member.role_in_project})
                  </li>
                )) || <li>No team members assigned</li>}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))
    ) : (
      <p className="text-center">No projects found.</p>
    )}
  </div>
);
