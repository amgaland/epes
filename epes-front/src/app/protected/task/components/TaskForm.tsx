// src/app/protected/task/components/TaskForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save, Trash2 } from "lucide-react";
import { TaskForm as TaskFormType, FormErrors, User, Project } from "../types";

interface TaskFormProps {
  formData: TaskFormType;
  errors: FormErrors;
  users: User[];
  projects: Project[];
  isSubmitting: boolean;
  isEdit?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<TaskFormType>>;
}

export function TaskForm({
  formData,
  errors,
  users,
  projects,
  isSubmitting,
  isEdit = false,
  onSubmit,
  onDelete,
  onCancel,
  onInputChange,
  setFormData,
}: TaskFormProps) {
  return (
    <TooltipProvider>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="project_id">Project</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  name="project_id"
                  value={formData.project_id}
                  onValueChange={(value: string) => {
                    setFormData((prev) => ({ ...prev, project_id: value }));
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="project_id"
                    className={errors.project_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Select the project for this task</TooltipContent>
            </Tooltip>
            {errors.project_id && (
              <p className="text-sm text-red-500">{errors.project_id}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={onInputChange}
                  placeholder="Enter task title"
                  className={errors.title ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
              </TooltipTrigger>
              <TooltipContent>Enter a brief title for the task</TooltipContent>
            </Tooltip>
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  placeholder="Enter task description (optional)"
                  disabled={isSubmitting}
                />
              </TooltipTrigger>
              <TooltipContent>Provide details about the task</TooltipContent>
            </Tooltip>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assigned_to_id">Assigned To</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  name="assigned_to_id"
                  value={formData.assigned_to_id}
                  onValueChange={(value: string) => {
                    setFormData((prev) => ({ ...prev, assigned_to_id: value }));
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="assigned_to_id">
                    <SelectValue placeholder="Select a user or leave unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                Assign the task to a user or leave unassigned
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value: string) => {
                    setFormData((prev) => ({
                      ...prev,
                      status: value as "Pending" | "In Progress" | "Completed",
                    }));
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="status"
                    className={errors.status ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                Select the current status of the task
              </TooltipContent>
            </Tooltip>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={onInputChange}
                  className={errors.deadline ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
              </TooltipTrigger>
              <TooltipContent>Select the deadline (optional)</TooltipContent>
            </Tooltip>
            {errors.deadline && (
              <p className="text-sm text-red-500">{errors.deadline}</p>
            )}
          </div>

          {formData.status === "Completed" && (
            <div className="grid gap-2">
              <Label htmlFor="completed_at">Completed At</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="completed_at"
                    name="completed_at"
                    type="date"
                    value={formData.completed_at}
                    onChange={onInputChange}
                    className={errors.completed_at ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Select the date the task was completed
                </TooltipContent>
              </Tooltip>
              {errors.completed_at && (
                <p className="text-sm text-red-500">{errors.completed_at}</p>
              )}
            </div>
          )}

          <div className="flex justify-between gap-4">
            {isEdit && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isSubmitting}
                  >
                    Delete Task
                    <Trash2 className="ml-2 h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Task"
                    : "Create Task"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </TooltipProvider>
  );
}
