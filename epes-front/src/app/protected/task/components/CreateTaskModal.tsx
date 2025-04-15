// src/app/protected/task/components/CreateTaskModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useTaskForm } from "../hooks/useTaskForm";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const {
    isLoading,
    isSubmitting,
    users,
    projects,
    formData,
    errors,
    setFormData,
    setErrors,
    handleSubmit,
    handleInputChange,
  } = useTaskForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          formData={formData}
          errors={errors}
          users={users}
          projects={projects}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onInputChange={handleInputChange}
          setFormData={setFormData}
        />
      </DialogContent>
    </Dialog>
  );
}
