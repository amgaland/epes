// src/app/protected/kpi/components/KPIReportDialog.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import DOMPurify from "dompurify";
import { EmployeeKPI, ReportConfig } from "../types";

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
  const [preview, setPreview] = useState<string | null>(null);

  const handlePreview = () => {
    const filteredKPIs =
      config.employeeId === "all"
        ? kpis
        : kpis.filter((kpi) => kpi.employeeId === config.employeeId);
    const previewContent = filteredKPIs
      .map(
        (kpi) => `
          <div class="mb-4">
            <h2 class="text-lg font-bold">${kpi.employeeName}</h2>
            <p>Performance Score: ${kpi.performanceScore}</p>
            <p>Status: ${kpi.status}</p>
            <p>Task Completion: ${kpi.taskCompletionRate}%</p>
            <p>Project Contribution: ${kpi.projectContribution}%</p>
          </div>
        `
      )
      .join("");
    setPreview(previewContent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Performance Report</DialogTitle>
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
              <SelectTrigger id="employeeId" aria-label="Select employee">
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
            <Label htmlFor="period">Period</Label>
            <Select
              value={config.period}
              onValueChange={(value) =>
                setConfig((prev) => ({ ...prev, period: value as any }))
              }
            >
              <SelectTrigger id="period" aria-label="Select period">
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
          <div className="flex gap-2">
            <Button onClick={handlePreview}>Preview Report</Button>
            <Button onClick={onGenerate}>Generate PDF</Button>
          </div>
          {preview && (
            <div
              className="border p-4 max-h-[300px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(preview) }}
              aria-label="Report preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
