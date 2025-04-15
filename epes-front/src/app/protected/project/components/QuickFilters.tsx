import { Button } from "@/components/ui/button";

interface QuickFiltersProps {
  filterStatus: "All" | "Active" | "Pending" | "Completed";
  setFilterStatus: (status: "All" | "Active" | "Pending" | "Completed") => void;
}

export function QuickFilters({
  filterStatus,
  setFilterStatus,
}: QuickFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={filterStatus === "All" ? "default" : "outline"}
        onClick={() => setFilterStatus("All")}
      >
        All
      </Button>
      <Button
        variant={filterStatus === "Active" ? "default" : "outline"}
        onClick={() => setFilterStatus("Active")}
      >
        Active
      </Button>
      <Button
        variant={filterStatus === "Pending" ? "default" : "outline"}
        onClick={() => setFilterStatus("Pending")}
      >
        Pending
      </Button>
      <Button
        variant={filterStatus === "Completed" ? "default" : "outline"}
        onClick={() => setFilterStatus("Completed")}
      >
        Completed
      </Button>
    </div>
  );
}
