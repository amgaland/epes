"use client";

import { useState } from "react";
import { EvaluationService } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SubmitScoreFormProps {
  employeeId: string;
  token: string;
  onClose?: () => void;
}

export default function SubmitScoreForm({
  employeeId,
  token,
  onClose,
}: SubmitScoreFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employee_id: employeeId,
    metric_id: 1,
    score: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await EvaluationService.createEvaluation(
        {
          ...formData,
          employee_id: employeeId,
          metric_id: Number(formData.metric_id),
          score: Number(formData.score),
        },
        token
      );
      setSuccess("Evaluation created successfully");
      setError(null);
      toast({
        title: "Success",
        description: "Evaluation created successfully",
      });
      if (onClose) onClose();
    } catch (err) {
      console.error("Create evaluation error:", err);
      setError("Failed to create evaluation");
      setSuccess(null);
      toast({
        title: "Error",
        description: "Failed to create evaluation",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">
          {onClose ? "Create Evaluation" : "Submit Score"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Metric ID</label>
            <Input
              type="number"
              value={formData.metric_id}
              onChange={(e) =>
                setFormData({ ...formData, metric_id: Number(e.target.value) })
              }
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Score</label>
            <Input
              type="number"
              value={formData.score}
              onChange={(e) =>
                setFormData({ ...formData, score: Number(e.target.value) })
              }
              className="mt-1"
              min="0"
              max="100"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <div className="flex gap-2">
            <Button type="submit" className="w-full">
              {onClose ? "Create" : "Submit"}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
