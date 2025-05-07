import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Employee, Feedback } from "../types";
import { format } from "date-fns";

export const FeedbackModal = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (employeeId: string, feedback: string) => void;
}) => {
  const [feedbackText, setFeedbackText] = useState("");

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Feedback for {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Existing Feedback</h4>
            {employee.feedback.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {employee.feedback.map((f: Feedback, i) => (
                  <li key={i}>
                    {f.text} <br />
                    <span className="text-xs">
                      By {f.author} on {format(new Date(f.createdAt), "PPp")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No feedback yet.</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium">Add Feedback</h4>
            <Input
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback..."
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (feedbackText.trim()) {
                onSubmit(employee.id, feedbackText);
                setFeedbackText("");
              }
            }}
            disabled={!feedbackText.trim()}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
