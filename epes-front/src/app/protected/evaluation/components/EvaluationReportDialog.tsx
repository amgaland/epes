import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeEvaluation, ReportConfig } from "../types";

interface EvaluationReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluations: EmployeeEvaluation[];
  config: ReportConfig;
  setConfig: (config: ReportConfig) => void;
  onGenerate: () => void;
}

export const EvaluationReportDialog: React.FC<EvaluationReportDialogProps> = ({
  open,
  onOpenChange,
  evaluations,
  config,
  setConfig,
  onGenerate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Evaluation Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={config.employeeId}
              onValueChange={(value) =>
                setConfig({ ...config, employeeId: value })
              }
            >
              <SelectTrigger id="employeeId">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {evaluations.map((evalItem) => (
                  <SelectItem
                    key={evalItem.employeeId}
                    value={evalItem.employeeId}
                  >
                    {evalItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              value={config.period}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  period: value as "allTime" | "lastQuarter" | "lastYear",
                })
              }
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allTime">All Time</SelectItem>
                <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFeedback"
                checked={config.includeFeedback}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, includeFeedback: !!checked })
                }
              />
              <Label htmlFor="includeFeedback">Include 360° Feedback</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeOKRs"
                checked={config.includeOKRs}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, includeOKRs: !!checked })
                }
              />
              <Label htmlFor="includeOKRs">Include OKR Progress</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeComments"
                checked={config.includeComments}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, includeComments: !!checked })
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
          <Button onClick={onGenerate}>Generate Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
