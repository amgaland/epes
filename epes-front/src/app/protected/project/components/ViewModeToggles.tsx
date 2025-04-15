import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Table as TableIcon } from "lucide-react";

interface ViewModeTogglesProps {
  viewMode: "table" | "grid" | "list";
  setViewMode: (mode: "table" | "grid" | "list") => void;
}

export function ViewModeToggles({
  viewMode,
  setViewMode,
}: ViewModeTogglesProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === "table" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("table")}
      >
        <TableIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
