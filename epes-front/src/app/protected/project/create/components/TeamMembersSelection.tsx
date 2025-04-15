import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

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

interface TeamMembersSelectionProps {
  users: User[];
  form: ProjectForm;
  setForm: React.Dispatch<React.SetStateAction<ProjectForm>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  isSubmitting: boolean;
}

export function TeamMembersSelection({
  users,
  form,
  setForm,
  errors,
  setErrors,
  isSubmitting,
}: TeamMembersSelectionProps) {
  const availableUsers = useMemo(
    () =>
      users.filter((u) => !form.team_members.some((m) => m.user_id === u.id)),
    [users, form.team_members]
  );

  const handleTeamMemberToggle = useCallback(
    (user: User, role: string) => {
      const isSelected = form.team_members.some((m) => m.user_id === user.id);
      const updated = isSelected
        ? form.team_members.filter((m) => m.user_id !== user.id)
        : [
            ...form.team_members,
            { user_id: user.id, role_in_project: role, name: user.name },
          ];
      setForm({ ...form, team_members: updated });
      setErrors({ ...errors, team_members: undefined });
    },
    [form, errors, setForm, setErrors]
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setForm((prev) => {
        const updatedMembers = [...prev.team_members];
        const lastMember = updatedMembers[updatedMembers.length - 1];
        if (lastMember) {
          lastMember.role_in_project = value;
        }
        return {
          ...prev,
          team_members: updatedMembers,
        };
      });
    },
    [setForm]
  );

  return (
    <div className="space-y-1">
      <Label>Team Members</Label>
      <div className="flex gap-2">
        <Select
          onValueChange={(value) => {
            const user = users.find((u) => u.id === value);
            if (user) handleTeamMemberToggle(user, "Developer");
          }}
          disabled={isSubmitting || availableUsers.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Add member" />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={handleRoleChange}
          disabled={isSubmitting || form.team_members.length === 0}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Developer">Developer</SelectItem>
            <SelectItem value="Designer">Designer</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="QA">QA</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {form.team_members.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center gap-2 bg-muted px-2 py-1 rounded"
          >
            <span>
              {member.name} ({member.role_in_project})
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4"
              onClick={() =>
                handleTeamMemberToggle(
                  { id: member.user_id, name: member.name },
                  member.role_in_project
                )
              }
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {errors.team_members && (
        <p className="text-sm text-red-500">{errors.team_members}</p>
      )}
    </div>
  );
}
