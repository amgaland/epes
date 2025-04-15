import { ProjectTable } from "./ProjectTable";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectList } from "./ProjectList";
import { Project } from "../types";

interface ProjectViewsProps {
  viewMode: "table" | "grid" | "list";
  projects: Project[];
  handleSort: (field: keyof Project) => void;
  handleProjectClick: (projectId: string) => void;
}

export function ProjectViews({
  viewMode,
  projects,
  handleSort,
  handleProjectClick,
}: ProjectViewsProps) {
  return (
    <>
      {viewMode === "table" && (
        <ProjectTable
          projects={projects}
          handleSort={handleSort}
          handleProjectClick={handleProjectClick}
        />
      )}
      {viewMode === "grid" && (
        <ProjectGrid
          projects={projects}
          handleProjectClick={handleProjectClick}
        />
      )}
      {viewMode === "list" && (
        <ProjectList
          projects={projects}
          handleProjectClick={handleProjectClick}
        />
      )}
    </>
  );
}
