// src/app/protected/kpi/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { DeleteDialog } from "../../components/DeleteDialog";
import { fetchKPIById, updateKPI, deleteKPI } from "../../services/kpiService";
import { EmployeeKPI } from "../../types";

const EditKPIPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [kpi, setKPI] = useState<EmployeeKPI | null>(null);
  const [formData, setFormData] = useState<Partial<EmployeeKPI>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token || !params.id) {
        toast({
          title: "Authentication Error",
          description: "Authentication token or KPI ID missing.",
          variant: "destructive",
        });
        router.push("/protected/kpi");
        return;
      }

      try {
        setIsLoading(true);
        const kpiData = await fetchKPIById(
          params.id as string,
          session.user.token
        );
        setKPI(kpiData);
        setFormData(kpiData);
      } catch (error: any) {
        console.error("Failed to fetch KPI:", error);
        toast({
          title: "Error",
          description: "Failed to load KPI data: " + error.message,
          variant: "destructive",
        });
        router.push("/protected/kpi");
      } finally {
        setIsLoading(false);
      }
    };

    if (session && params.id) {
      fetchData();
    }
  }, [session, params.id, router, toast]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (
      formData.tasksCompleted === undefined ||
      formData.tasksCompleted < 0 ||
      isNaN(formData.tasksCompleted)
    ) {
      newErrors.tasksCompleted =
        "Tasks completed must be a non-negative number";
    }
    if (
      formData.tasksAssigned === undefined ||
      formData.tasksAssigned < 0 ||
      isNaN(formData.tasksAssigned)
    ) {
      newErrors.tasksAssigned = "Tasks assigned must be a non-negative number";
    }
    if (
      formData.tasksCompleted !== undefined &&
      formData.tasksAssigned !== undefined &&
      formData.tasksCompleted > formData.tasksAssigned
    ) {
      newErrors.tasksCompleted = "Tasks completed cannot exceed tasks assigned";
    }
    if (
      formData.projectsAssigned === undefined ||
      formData.projectsAssigned < 0 ||
      isNaN(formData.projectsAssigned)
    ) {
      newErrors.projectsAssigned =
        "Projects assigned must be a non-negative number";
    }
    if (
      formData.projectContribution === undefined ||
      formData.projectContribution < 0 ||
      formData.projectContribution > 100 ||
      isNaN(formData.projectContribution)
    ) {
      newErrors.projectContribution =
        "Project contribution must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof EmployeeKPI
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : parseInt(value),
    }));
  };

  const handleStatusChange = (
    value: "Excellent" | "Good" | "Needs Improvement"
  ) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !validateForm()) {
      return;
    }

    const taskCompletionRate =
      formData.tasksAssigned && formData.tasksAssigned > 0
        ? (formData.tasksCompleted! / formData.tasksAssigned) * 100
        : 0;
    const performanceScore =
      0.6 * taskCompletionRate + 0.4 * (formData.projectContribution || 0);

    const updatedKPI = {
      taskCompletionRate: Math.round(taskCompletionRate),
      tasksCompleted: formData.tasksCompleted,
      tasksAssigned: formData.tasksAssigned,
      projectContribution: formData.projectContribution,
      projectsAssigned: formData.projectsAssigned,
      performanceScore: Math.round(performanceScore),
      status: formData.status,
    };

    try {
      await updateKPI(params.id as string, updatedKPI, session.user.token);
      toast({
        title: "Success",
        description: "KPI updated successfully.",
      });
      router.push("/protected/kpi");
    } catch (error: any) {
      console.error("Failed to update KPI:", error);
      toast({
        title: "Error",
        description: "Failed to update KPI: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.token) return;

    try {
      await deleteKPI(params.id as string, session.user.token);
      toast({
        title: "Success",
        description: "KPI deleted successfully.",
      });
      router.push("/protected/kpi");
    } catch (error: any) {
      console.error("Failed to delete KPI:", error);
      toast({
        title: "Error",
        description: "Failed to delete KPI: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen bg-background p-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/auth/signin");
    return null;
  }

  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "Only admins can access this page.",
      variant: "destructive",
    });
    router.push("/protected");
    return null;
  }

  if (!kpi) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit KPI - {kpi.employeeName}</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push("/protected/kpi")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="tasksCompleted">Tasks Completed</Label>
              <Input
                id="tasksCompleted"
                type="number"
                value={formData.tasksCompleted ?? ""}
                onChange={(e) => handleInputChange(e, "tasksCompleted")}
                min="0"
              />
              {errors.tasksCompleted && (
                <p className="text-sm text-destructive mt-1">
                  {errors.tasksCompleted}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="tasksAssigned">Tasks Assigned</Label>
              <Input
                id="tasksAssigned"
                type="number"
                value={formData.tasksAssigned ?? ""}
                onChange={(e) => handleInputChange(e, "tasksAssigned")}
                min="0"
              />
              {errors.tasksAssigned && (
                <p className="text-sm text-destructive mt-1">
                  {errors.tasksAssigned}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="projectContribution">
                Project Contribution (%)
              </Label>
              <Input
                id="projectContribution"
                type="number"
                value={formData.projectContribution ?? ""}
                onChange={(e) => handleInputChange(e, "projectContribution")}
                min="0"
                max="100"
              />
              {errors.projectContribution && (
                <p className="text-sm text-destructive mt-1">
                  {errors.projectContribution}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="projectsAssigned">Projects Assigned</Label>
              <Input
                id="projectsAssigned"
                type="number"
                value={formData.projectsAssigned ?? ""}
                onChange={(e) => handleInputChange(e, "projectsAssigned")}
                min="0"
              />
              {errors.projectsAssigned && (
                <p className="text-sm text-destructive mt-1">
                  {errors.projectsAssigned}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Needs Improvement">
                    Needs Improvement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="destructive"
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete KPI
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EditKPIPage;
