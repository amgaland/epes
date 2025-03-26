"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Calendar, Check, X } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface ProjectForm {
  name: string;
  status: "Active" | "Pending" | "Completed";
  dueDate: string;
  teamSize: number;
  description: string;
  teamMembers: TeamMember[];
}

interface FormErrors {
  name?: string;
  status?: string;
  dueDate?: string;
  teamSize?: string;
  description?: string;
  teamMembers?: string;
}

// Mock team members (replace with API data)
const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "John Doe", role: "Developer" },
  { id: "2", name: "Jane Smith", role: "Designer" },
  { id: "3", name: "Mike Johnson", role: "Manager" },
  { id: "4", name: "Emily Brown", role: "Developer" },
  { id: "5", name: "Alex Lee", role: "QA Engineer" },
];

const CreateProjectPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    status: "Pending",
    dueDate: "",
    teamSize: 1,
    description: "",
    teamMembers: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

  if (!isAdmin && !isManager) {
    router.push("/unauthorized");
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "teamSize" ? Math.max(1, parseInt(value) || 1) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleStatusChange = (value: "Active" | "Pending" | "Completed") => {
    setForm((prev) => ({ ...prev, status: value }));
    setErrors((prev) => ({ ...prev, status: undefined }));
  };

  const handleTeamMemberToggle = (member: TeamMember) => {
    setForm((prev) => {
      const isSelected = prev.teamMembers.some((m) => m.id === member.id);
      const updatedTeamMembers = isSelected
        ? prev.teamMembers.filter((m) => m.id !== member.id)
        : [...prev.teamMembers, member];
      return {
        ...prev,
        teamMembers: updatedTeamMembers,
        teamSize: updatedTeamMembers.length, // Auto-update teamSize
      };
    });
    setErrors((prev) => ({ ...prev, teamMembers: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name) newErrors.name = "Project name is required";
    if (!form.dueDate) newErrors.dueDate = "Due date is required";
    if (form.teamMembers.length === 0)
      newErrors.teamMembers = "At least one team member is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newProject = {
      ...form,
      id: Math.random().toString(36).substr(2, 9), // Mock ID
    };
    console.log("New Project Created:", newProject);
    router.push("/projects");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Create New Project
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <div className="relative">
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={form.dueDate}
                        onChange={handleChange}
                        className={errors.dueDate ? "border-red-500" : ""}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {errors.dueDate && (
                      <p className="text-sm text-red-500">{errors.dueDate}</p>
                    )}
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="space-y-2">
                      <Select
                        onValueChange={(value) =>
                          handleTeamMemberToggle(
                            mockTeamMembers.find((m) => m.id === value)!
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add team members" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockTeamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Display selected team members */}
                      <div className="flex flex-wrap gap-2">
                        {form.teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md"
                          >
                            <span>{member.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-4 w-4"
                              onClick={() => handleTeamMemberToggle(member)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {errors.teamMembers && (
                        <p className="text-sm text-red-500">
                          {errors.teamMembers}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Team Size (Read-only, derived from teamMembers) */}
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      value={form.teamMembers.length}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter project description"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/projects")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Project</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateProjectPage;
