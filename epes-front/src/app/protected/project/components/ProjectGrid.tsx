import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project } from "../types";

interface ProjectGridProps {
  projects: Project[];
  handleProjectClick: (projectId: string) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  handleProjectClick,
}) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {projects.length > 0 ? (
      projects.map((project) => (
        <TooltipProvider key={project.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                onClick={() => handleProjectClick(project.id)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
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
                    <p className="text-sm text-muted-foreground">
                      Due: {project.dueDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Team: {project.teamSize} members
                    </p>
                    <Progress value={project.progress || 0} />
                  </div>
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
      <p className="text-center col-span-full">No projects found.</p>
    )}
  </div>
);
