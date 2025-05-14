import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CreateEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEvaluationModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEvaluationModalProps) {
  const { data: session } = useSession();
  const [type, setType] = useState<"KPI" | "OKR" | "Feedback">("KPI");
  const [employeeId, setEmployeeId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      if (!session?.user?.token) return;
      try {
        const [projectRes, taskRes] = await Promise.all([
          fetch("/api/protected/projects", {
            headers: { Authorization: `Bearer ${session.user.token}` },
          }),
          fetch("/api/protected/tasks", {
            headers: { Authorization: `Bearer ${session.user.token}` },
          }),
        ]);
        if (projectRes.ok) {
          const data = await projectRes.json();
          setProjects(
            data.map((p: any) => ({ id: p.id, name: p.name || p.id }))
          );
        }
        if (taskRes.ok) {
          const data = await taskRes.json();
          setTasks(data.map((t: any) => ({ id: t.id, name: t.name || t.id })));
        }
      } catch (error) {
        console.error("Error fetching projects/tasks:", error);
      }
    };
    if (isOpen) {
      fetchProjectsAndTasks();
    }
  }, [isOpen, session]);

  const handleSubmit = async () => {
    if (!session?.user?.token) {
      alert("No token found");
      return;
    }
    try {
      const payload = {
        employee_id: employeeId,
        project_id: projectId || null,
        task_id: type === "Feedback" ? taskId : null,
        ...(type === "KPI" && {
          score: parseFloat(value),
          metric_id: description,
        }),
        ...(type === "OKR" && {
          objective: value,
          key_results: description.split(","),
        }),
        ...(type === "Feedback" && {
          comment: value,
          rating: parseInt(description),
        }),
      };
      const endpoint = `/api/protected/evaluations/${
        type === "KPI" ? "scores" : type === "OKR" ? "okrs" : "feedback"
      }`;
      console.log("Submitting to:", endpoint, "Payload:", payload);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log("Submission successful");
        onSuccess();
      } else {
        const error = await res.json();
        console.error("Submission failed:", error);
        alert(
          `Failed to create evaluation: ${error.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error creating evaluation:", error);
      alert("Error creating evaluation");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Evaluation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            onValueChange={(value) =>
              setType(value as "KPI" | "OKR" | "Feedback")
            }
            value={type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KPI">KPI</SelectItem>
              <SelectItem value="OKR">OKR</SelectItem>
              <SelectItem value="Feedback">Feedback</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <Select onValueChange={setProjectId} value={projectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={setTaskId}
            value={taskId}
            disabled={type !== "Feedback"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Task" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={
              type === "KPI"
                ? "Score"
                : type === "OKR"
                ? "Objective"
                : "Comment"
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Input
            placeholder={
              type === "KPI"
                ? "Metric ID"
                : type === "OKR"
                ? "Key Results (comma-separated)"
                : "Rating"
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
