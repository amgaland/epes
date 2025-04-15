// src/app/protected/kpi/components/KPIReportDialog.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportConfig, EmployeeKPI } from "../types";

interface KPIReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpis: EmployeeKPI[];
  config: ReportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ReportConfig>>;
  onGenerate: () => void;
}

export function KPIReportDialog({
  open,
  onOpenChange,
  kpis,
  config,
  setConfig,
  onGenerate,
}: KPIReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Performance Report</DialogTitle>
          <DialogDescription>
            Configure the performance evaluation report settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="employee-select">Employee</Label>
            <Select
              value={config.employeeId}
              onValueChange={(value) =>
                setConfig({ ...config, employeeId: value })
              }
            >
              <SelectTrigger id="employee-select">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {kpis.map((kpi) => (
                  <SelectItem key={kpi.employeeId} value={kpi.employeeId}>
                    {kpi.employeeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="period-select">Time Period</Label>
            <Select
              value={config.period}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  period: value as ReportConfig["period"],
                })
              }
            >
              <SelectTrigger id="period-select">
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
              <input
                type="checkbox"
                id="include-tasks"
                checked={config.includeTasks}
                onChange={(e) =>
                  setConfig({ ...config, includeTasks: e.target.checked })
                }
              />
              <Label htmlFor="include-tasks">Include Task Details</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-projects"
                checked={config.includeProjects}
                onChange={(e) =>
                  setConfig({ ...config, includeProjects: e.target.checked })
                }
              />
              <Label htmlFor="include-projects">Include Project Details</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-comments"
                checked={config.includeComments}
                onChange={(e) =>
                  setConfig({ ...config, includeComments: e.target.checked })
                }
              />
              <Label htmlFor="include-comments">
                Employee Performance Comments
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onGenerate}>Generate PDF Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
