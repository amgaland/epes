// src/app/protected/task/create/page.tsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskForm } from "../components/TaskForm";
import { useTaskForm } from "../hooks/useTaskForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

  useEffect(() => {
    if (session && !isAdmin && !isManager) {
      router.push("/protected/task");
    }
  }, [session, isAdmin, isManager, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <Skeleton className="h-10 w-[250px] mb-6" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session || (!isAdmin && !isManager)) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/protected/task")}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to Tasks</TooltipContent>
              </Tooltip>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create New Task
              </h1>
            </div>
          </header>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <TaskForm
              formData={formData}
              errors={errors}
              users={users}
              projects={projects}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              setFormData={setFormData}
            />
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
