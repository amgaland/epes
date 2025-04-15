"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { req } from "@/app/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectFormInputs } from "../components/ProjectFormInputs";
import { TeamMembersSelection } from "../components/TeamMembersSelection";
import { FormActions } from "../components/FormActions";
import { LoadingState } from "../components/LoadingState";

interface User {
  id: string;
  name: string;
}

interface ProjectMember {
  user_id: string;
  role_in_project: string;
  name: string;
}

interface ProjectForm {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Ongoing" | "Completed" | "Delayed";
  owner_id: string;
  team_members: ProjectMember[];
}

interface FormErrors {
  name?: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  team_members?: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "Ongoing",
    owner_id: "",
    team_members: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchUsers = useCallback(async () => {
    if (!session?.user?.token) {
      alert("Please log in again.");
      onClose();
      return;
    }
    try {
      setIsLoading(true);
      const response = await req.GET("/admin/users", session.user.token);
      const mappedUsers: User[] = response.map((u: any) => ({
        id: u.id,
        name:
          `${u.firstname || u.first_name || ""} ${
            u.lastname || u.last_name || ""
          }`.trim() || u.id,
      }));
      setUsers(mappedUsers);
    } catch (error: any) {
      alert("Failed to load users.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, onClose]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    if (!form.name) newErrors.name = "Name required";
    if (!form.start_date) newErrors.start_date = "Start date required";
    if (!form.owner_id) newErrors.owner_id = "Owner required";
    if (form.team_members.length === 0)
      newErrors.team_members = "Add at least one member";
    if (form.end_date && new Date(form.end_date) < new Date(form.start_date))
      newErrors.end_date = "End date must be after start";
    const memberIds = form.team_members.map((m) => m.user_id);
    if (new Set(memberIds).size !== memberIds.length)
      newErrors.team_members = "No duplicate members";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      if (!session?.user?.token) {
        alert("Please log in again.");
        onClose();
        return;
      }
      setIsSubmitting(true);
      try {
        const payload = {
          name: form.name,
          description: form.description,
          start_date: new Date(form.start_date).toISOString(),
          end_date: form.end_date ? new Date(form.end_date).toISOString() : "",
          status: form.status,
          owner_id: form.owner_id,
          team_members: form.team_members.map((m) => ({
            user_id: m.user_id,
            role_in_project: m.role_in_project,
          })),
        };
        await req.POST("/protected/projects", session.user.token, payload);
        onSuccess?.();
        onClose();
      } catch (error: any) {
        const msg = error?.response?.data?.error || error.message;
        if (msg === "user already in project") {
          alert("One or more team members are already assigned.");
        } else {
          alert(`Failed to create project: ${msg}`);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, session, validateForm, onClose, onSuccess]
  );

  useEffect(() => {
    if (session && isOpen) {
      fetchUsers();
      setForm((prev) => ({ ...prev, owner_id: session.user.id }));
    }
  }, [session, fetchUsers, isOpen]);

  if (status === "loading" || !session) {
    return null;
  }

  const isAdmin = session?.user?.roles?.includes("ADMIN");
  const isManager = session?.user?.roles?.includes("MANAGER");
  if (!isAdmin && !isManager) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <LoadingState />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <ProjectFormInputs
              form={form}
              errors={errors}
              setForm={setForm}
              setErrors={setErrors}
              isSubmitting={isSubmitting}
              ownerName={
                `${session.user.firstname || ""} ${session.user.lastname || ""}`.trim() ||
                session.user.id
              }
            />
            <TeamMembersSelection
              users={users}
              form={form}
              setForm={setForm}
              errors={errors}
              setErrors={setErrors}
              isSubmitting={isSubmitting}
            />
            <FormActions isSubmitting={isSubmitting} onCancel={onClose} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
