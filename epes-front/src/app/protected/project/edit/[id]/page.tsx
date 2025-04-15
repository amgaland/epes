"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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
import { Calendar, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string;
  role?: string;
}

interface ProjectMember {
  user_id: string;
  role_in_project: string;
  name: string;
}

interface ProjectForm {
  id?: string;
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
  status?: string;
  owner_id?: string;
  team_members?: string;
}

const EditProjectPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    const fetchUsersAndProject = async () => {
      if (!session?.user?.token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token missing. Please log in again.",
        });
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        const usersResponse = await req.GET("/admin/users", session.user.token);
        const mappedUsers: User[] = usersResponse.map((u: any) => ({
          id: u.id,
          name:
            `${u.firstname || u.first_name || ""} ${
              u.lastname || u.last_name || ""
            }`.trim() ||
            u.username ||
            u.id,
        }));
        setUsers(mappedUsers);

        if (projectId) {
          const projectResponse = await req.GET(
            `/protected/projects?id=${projectId}`,
            session.user.token
          );
          const projectData = projectResponse;
          setForm({
            id: projectData.id,
            name: projectData.name,
            description: projectData.description || "",
            start_date: new Date(projectData.start_date)
              .toISOString()
              .split("T")[0],
            end_date: projectData.end_date
              ? new Date(projectData.end_date).toISOString().split("T")[0]
              : "",
            status: projectData.status,
            owner_id: projectData.owner_id,
            team_members: projectData.team_members.map((m: any) => ({
              user_id: m.user_id,
              role_in_project: m.role_in_project,
              name:
                mappedUsers.find((u) => u.id === m.user_id)?.name || m.user_id,
            })),
          });
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data: " + error.message,
        });
        setUsers([
          { id: "123e4567-e89b-12d3-a456-426614174000", name: "John Doe" },
          { id: "223e4567-e89b-12d3-a456-426614174001", name: "Jane Smith" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session && projectId) {
      fetchUsersAndProject();
      setForm((prev) => ({
        ...prev,
        owner_id: session.user.id,
      }));
    }
  }, [session, projectId, router, toast]);

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

  const roles = session?.user?.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

  if (!isAdmin && !isManager) {
    router.push("/unauthorized");
    return null;
  }

  const ownerName =
    `${session.user.firstname || ""} ${session.user.lastname || ""}`.trim() ||
    session.user.username ||
    "Unknown";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleStatusChange = (value: "Ongoing" | "Completed" | "Delayed") => {
    setForm((prev) => ({ ...prev, status: value }));
    setErrors((prev) => ({ ...prev, status: undefined }));
  };

  const handleTeamMemberToggle = (user: User, role: string) => {
    setForm((prev) => {
      const isSelected = prev.team_members.some((m) => m.user_id === user.id);
      let updatedTeamMembers: ProjectMember[];
      if (isSelected) {
        updatedTeamMembers = prev.team_members.filter(
          (m) => m.user_id !== user.id
        );
      } else {
        updatedTeamMembers = [
          ...prev.team_members,
          { user_id: user.id, role_in_project: role, name: user.name },
        ];
      }
      return { ...prev, team_members: updatedTeamMembers };
    });
    setErrors((prev) => ({ ...prev, team_members: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name) newErrors.name = "Project name is required";
    if (!form.start_date) newErrors.start_date = "Start date is required";
    if (!form.owner_id) newErrors.owner_id = "Owner is required";
    if (form.team_members.length === 0)
      newErrors.team_members = "At least one team member is required";
    if (form.end_date && new Date(form.end_date) < new Date(form.start_date))
      newErrors.end_date = "End date cannot be before start date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!session?.user?.token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authentication token missing. Please log in again.",
      });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: form.id,
        name: form.name,
        description: form.description,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        status: form.status,
        owner_id: form.owner_id,
        team_members: form.team_members.map((m) => ({
          user_id: m.user_id,
          role_in_project: m.role_in_project,
        })),
      };

      await req.PUT(
        `/protected/projects/${projectId}`,
        session.user.token,
        payload
      );
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      router.push("/protected/project");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project: " + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Authentication token missing. Please log in again.",
      });
      router.push("/login");
      return;
    }

    setIsDeleting(true);
    try {
      await req.DELETE(`/protected/projects/${projectId}`, session.user.token);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      router.push("/protected/project");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project: " + error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Edit Project
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
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter project name"
                      className={errors.name ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner">Project Owner</Label>
                    <Input
                      id="owner"
                      value={ownerName}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
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
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>
                  <div className="space-y-2">
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
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {errors.start_date && (
                      <p className="text-sm text-red-500">
                        {errors.start_date}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date (Optional)</Label>
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
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {errors.end_date && (
                      <p className="text-sm text-red-500">{errors.end_date}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => {
                            const user = users.find((u) => u.id === value);
                            if (user) {
                              handleTeamMemberToggle(user, "Developer");
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add team members" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          onValueChange={(value) => {
                            setForm((prev) => {
                              const updatedMembers = [...prev.team_members];
                              if (updatedMembers.length > 0) {
                                updatedMembers[
                                  updatedMembers.length - 1
                                ].role_in_project = value;
                              }
                              return { ...prev, team_members: updatedMembers };
                            });
                          }}
                          disabled={isSubmitting}
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
                      <div className="flex flex-wrap gap-2">
                        {form.team_members.map((member) => (
                          <div
                            key={member.user_id}
                            className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md"
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
                        <p className="text-sm text-red-500">
                          {errors.team_members}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter project description"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-between gap-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={isSubmitting || isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Project"}
                          <Trash2 className="ml-2 h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this project? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/protected/project")}
                        disabled={isSubmitting || isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isDeleting}
                      >
                        {isSubmitting ? "Updating..." : "Update Project"}
                      </Button>
                    </div>
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

export default EditProjectPage;
