import { Button } from "@/components/ui/button";
import { CirclePlus, Download } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { exportToCSV } from "../utils/projectUtils";
import { Project } from "../types";

interface SearchAndActionsProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearchTerm: (value: string) => void;
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
  projects: Project[];
  onCreateProject: () => void;
}

export function SearchAndActions({
  searchInput,
  setSearchInput,
  setSearchTerm,
  isAdmin,
  isManager,
  isLoading,
  projects,
  onCreateProject,
}: SearchAndActionsProps) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearchTerm={setSearchTerm}
      />
      {(isAdmin || isManager) && (
        <Button onClick={onCreateProject}>
          <CirclePlus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
      )}
      {(isAdmin || isManager) && (
        <Button
          variant="outline"
          onClick={() => exportToCSV(projects)}
          disabled={isLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      )}
    </div>
  );
}
