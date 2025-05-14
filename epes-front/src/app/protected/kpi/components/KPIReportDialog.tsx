// src/app/protected/kpi/components/KPIReportDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EmployeeKPI, ReportConfig } from "../types";

interface KPIReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpis: EmployeeKPI[];
  config: ReportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfig>>;
  onGenerate: () => void;
}

export const KPIReportDialog: React.FC<KPIReportDialogProps> = ({
  open,
  onOpenChange,
  kpis,
  config,
  setConfig,
  onGenerate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Performance Report</DialogTitle>
          <DialogDescription>
            Configure the report settings and generate a PDF report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={config.employeeId}
              onValueChange={(value) =>
                setConfig((prev) => ({ ...prev, employeeId: value }))
              }
            >
              <SelectTrigger id="employeeId">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {kpis.map((kpi) => (
                  <SelectItem key={kpi.employee_id} value={kpi.employee_id}>
                    {kpi.employee_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="period">Period</Label>
            <Select
              value={config.period}
              onValueChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  period: value as ReportConfig["period"],
                }))
              }
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTasks"
                checked={config.includeTasks}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, includeTasks: !!checked }))
                }
              />
              <Label htmlFor="includeTasks">Include Tasks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeProjects"
                checked={config.includeProjects}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, includeProjects: !!checked }))
                }
              />
              <Label htmlFor="includeProjects">Include Projects</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeComments"
                checked={config.includeComments}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, includeComments: !!checked }))
                }
              />
              <Label htmlFor="includeComments">Include Comments</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onGenerate}>Generate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
