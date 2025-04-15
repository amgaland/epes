import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface ProjectForm {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Ongoing" | "Completed" | "Delayed";
  owner_id: string;
  team_members: { user_id: string; role_in_project: string; name: string }[];
}

interface FormErrors {
  name?: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  team_members?: string;
}

interface ProjectFormInputsProps {
  form: ProjectForm;
  errors: FormErrors;
  setForm: React.Dispatch<React.SetStateAction<ProjectForm>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  isSubmitting: boolean;
  ownerName: string;
}

export function ProjectFormInputs({
  form,
  errors,
  setForm,
  setErrors,
  isSubmitting,
  ownerName,
}: ProjectFormInputsProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [setForm, setErrors]
  );

  const handleStatusChange = useCallback(
    (value: "Ongoing" | "Completed" | "Delayed") => {
      setForm((prev) => ({ ...prev, status: value }));
      setErrors((prev) => ({ ...prev, status: undefined }));
    },
    [setForm, setErrors]
  );

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Project name"
          className={errors.name ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="owner">Owner</Label>
        <Input id="owner" value={ownerName} disabled />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <Select
          value={form.status}
          onValueChange={handleStatusChange}
          disabled={isSubmitting}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="start_date">Start Date</Label>
        <div className="relative">
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            className={errors.start_date ? "border-red-500" : ""}
            min={new Date().toISOString().split("T")[0]}
            disabled={isSubmitting}
          />
          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        {errors.start_date && (
          <p className="text-sm text-red-500">{errors.start_date}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="end_date">End Date</Label>
        <div className="relative">
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
            className={errors.end_date ? "border-red-500" : ""}
            min={form.start_date}
            disabled={isSubmitting}
          />
          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        {errors.end_date && (
          <p className="text-sm text-red-500">{errors.end_date}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Project description"
          disabled={isSubmitting}
        />
      </div>
    </>
  );
}
