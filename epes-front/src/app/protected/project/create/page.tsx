"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { req } from "@/app/api";
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
import { Calendar, X } from "lucide-react";

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

const CreateProjectPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
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
      router.push("/login");
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
  }, [session, router]);

  useEffect(() => {
    if (session) {
      fetchUsers();
      setForm((prev) => ({ ...prev, owner_id: session.user.id }));
    }
  }, [session, fetchUsers]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  const isAdmin = session?.user?.roles?.includes("ADMIN");
  const isManager = session?.user?.roles?.includes("MANAGER");
  if (!isAdmin && !isManager) {
    router.push("/unauthorized");
    return null;
  }

  const ownerName = useMemo(
    () =>
      `${session.user.firstname || ""} ${session.user.lastname || ""}`.trim() ||
      session.user.id,
    [session]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    []
  );

  const handleStatusChange = useCallback(
    (value: "Ongoing" | "Completed" | "Delayed") => {
      setForm((prev) => ({ ...prev, status: value }));
      setErrors((prev) => ({ ...prev, status: undefined }));
    },
    []
  );

  const handleTeamMemberToggle = useCallback((user: User, role: string) => {
    setForm((prev) => {
      const isSelected = prev.team_members.some((m) => m.user_id === user.id);
      const updated = isSelected
        ? prev.team_members.filter((m) => m.user_id !== user.id)
        : [
            ...prev.team_members,
            { user_id: user.id, role_in_project: role, name: user.name },
          ];
      return { ...prev, team_members: updated };
    });
    setErrors((prev) => ({ ...prev, team_members: undefined }));
  }, []);

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
        router.push("/login");
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
        router.push("/protected/project");
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
    [form, session, router, validateForm]
  );

  const availableUsers = useMemo(
    () =>
      users.filter((u) => !form.team_members.some((m) => m.user_id === u.id)),
    [users, form.team_members]
  );

  return (
    <div className="flex min-h-screen bg-background">
      <main className="p-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Create Project</h1>

        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
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
                    onValueChange={(value) => {
                      setForm((prev) => {
                        const lastMember =
                          prev.team_members[prev.team_members.length - 1];
                        if (lastMember) lastMember.role_in_project = value;
                        return {
                          ...prev,
                          team_members: [...prev.team_members],
                        };
                      });
                    }}
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
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/protected/project")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </main>
    </div>
  );
};

export default CreateProjectPage;
