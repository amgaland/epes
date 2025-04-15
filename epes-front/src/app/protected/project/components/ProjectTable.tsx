import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown } from "lucide-react";
import { Project } from "../types";

interface ProjectTableProps {
  projects: Project[];
  handleSort: (field: keyof Project) => void;
  handleProjectClick: (projectId: string) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  handleSort,
  handleProjectClick,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSort("name")}
        >
          Project Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSort("status")}
        >
          Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSort("dueDate")}
        >
          Due Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSort("teamSize")}
        >
          Team Size <ArrowUpDown className="ml-2 h-4 w-4 inline" />
        </TableHead>
        <TableHead>Progress</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {projects.length > 0 ? (
        projects.map((project) => (
          <TableRow
            key={project.id}
            onClick={() => handleProjectClick(project.id)} // Fixed: Removed invalid `handle - 1`
            className="cursor-pointer hover:bg-muted"
          >
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell>{project.dueDate}</TableCell>
            <TableCell>{project.teamSize}</TableCell>
            <TableCell>
              <Progress value={project.progress || 0} className="w-[60%]" />
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            No projects found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
