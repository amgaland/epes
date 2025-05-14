"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";

// Mock types (replace with your actual types)
interface Employee {
  id: string;
  name: string;
  department: string;
  period: string;
  role: string;
}

interface EvaluationForm {
  taskCompletion: number;
  quality: number;
  timeliness: number;
  okrGoals: {
    id: string;
    description: string;
    score: number;
    comment: string;
  }[];
  feedback: { source: string; comment: string }[];
  overallComment: string;
}

export default function EvaluationPage({
  params,
}: {
  params: { employeeId: string };
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EvaluationForm>({
    taskCompletion: 0,
    quality: 0,
    timeliness: 0,
    okrGoals: [
      { id: "1", description: "Complete project X", score: 0, comment: "" },
    ],
    feedback: [
      { source: "Peer", comment: "" },
      { source: "Manager", comment: "" },
    ],
    overallComment: "",
  });
  const [overallScore, setOverallScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"form" | "summary">("form");
  const [filterFeedback, setFilterFeedback] = useState<
    "All" | "Peer" | "Manager"
  >("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock session (replace with your auth logic)
  const session = { user: { id: "user1", role: "manager" } }; // Mock for demo
  const status = "authenticated"; // Mock for demo

  // Fetch employee data
  useEffect(() => {
    async function fetchEmployee() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/employees/${params.employeeId}`);
        if (!res.ok) throw new Error("Failed to fetch employee");
        const data = await res.json();
        setEmployee(data);
        setIsReadOnly(
          data.role === "employee" || session.user.role === "employee"
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmployee();
  }, [params.employeeId]);

  // Calculate weighted average
  useEffect(() => {
    const kpiScore = (
      form.taskCompletion * 0.4 +
      form.quality * 0.3 +
      form.timeliness * 0.3
    ).toFixed(2);
    setOverallScore(Number(kpiScore));
  }, [form.taskCompletion, form.quality, form.timeliness]);

  // Handle form submission
  const handleSubmit = async () => {
    if (isReadOnly) return;
    if (!form.taskCompletion || !form.quality || !form.timeliness) {
      toast({
        title: "Validation Error",
        description: "Please complete all KPI fields",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, employeeId: params.employeeId }),
      });
      if (!res.ok) throw new Error("Failed to submit evaluation");
      toast({
        title: "Success",
        description: "Evaluation submitted successfully",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock export (replace with jsPDF/PapaParse)
  const handleExport = (format: "pdf" | "csv") => {
    toast({
      title: "Export",
      description: `Exporting as ${format.toUpperCase()}...`,
    });
  };

  // Mock search (replace with actual logic)
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement employee search logic
  };

  if (status === "authenticated" && isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 pr-4 py-2 border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {!isReadOnly && (
            <>
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
        </div>

        {/* Main Content */}
        <main className="p-6 flex-1">
          {/* Employee Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Name</Label>
                  <p>{employee?.name || "N/A"}</p>
                </div>
                <div>
                  <Label>ID</Label>
                  <p>{employee?.id || "N/A"}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p>{employee?.department || "N/A"}</p>
                </div>
                <div>
                  <Label>Period</Label>
                  <p>{employee?.period || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Tabs and Filters */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Form */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Evaluation</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "form" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("form")}
                    >
                      <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "summary" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("summary")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Filters */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={filterFeedback === "All" ? "default" : "outline"}
                    onClick={() => setFilterFeedback("All")}
                  >
                    All Feedback
                  </Button>
                  <Button
                    variant={filterFeedback === "Peer" ? "default" : "outline"}
                    onClick={() => setFilterFeedback("Peer")}
                  >
                    Peer
                  </Button>
                  <Button
                    variant={
                      filterFeedback === "Manager" ? "default" : "outline"
                    }
                    onClick={() => setFilterFeedback("Manager")}
                  >
                    Manager
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "form" ? (
                  <Tabs defaultValue="kpi">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="kpi">KPI Scores</TabsTrigger>
                      <TabsTrigger value="okr">OKR Goals</TabsTrigger>
                      <TabsTrigger value="feedback">360 Feedback</TabsTrigger>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>

                    {/* KPI Scores */}
                    <TabsContent value="kpi">
                      <div className="space-y-6">
                        <div>
                          <Label>Task Completion (40%)</Label>
                          <Slider
                            value={[form.taskCompletion]}
                            onValueChange={(val) =>
                              setForm({ ...form, taskCompletion: val[0] })
                            }
                            max={100}
                            step={1}
                            disabled={isReadOnly}
                            aria-label="Task Completion"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Score: {form.taskCompletion}/100
                          </p>
                        </div>
                        <div>
                          <Label>Work Quality (30%)</Label>
                          <Select
                            onValueChange={(val) =>
                              setForm({ ...form, quality: Number(val) })
                            }
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">
                                Excellent (100)
                              </SelectItem>
                              <SelectItem value="80">Good (80)</SelectItem>
                              <SelectItem value="60">Average (60)</SelectItem>
                              <SelectItem value="40">
                                Needs Improvement (40)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground mt-2">
                            Score: {form.quality || "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label>Timeliness (30%)</Label>
                          <Slider
                            value={[form.timeliness]}
                            onValueChange={(val) =>
                              setForm({ ...form, timeliness: val[0] })
                            }
                            max={100}
                            step={1}
                            disabled={isReadOnly}
                            aria-label="Timeliness"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Score: {form.timeliness}/100
                          </p>
                        </div>
                        <div>
                          <Label>KPI Comment</Label>
                          <Textarea
                            placeholder="Add comments about KPI performance..."
                            value={form.overallComment}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                overallComment: e.target.value,
                              })
                            }
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* OKR Goals */}
                    <TabsContent value="okr">
                      <div className="space-y-6">
                        {form.okrGoals.map((goal, index) => (
                          <div key={goal.id} className="space-y-2">
                            <Label>{goal.description}</Label>
                            <Slider
                              value={[goal.score]}
                              onValueChange={(val) =>
                                setForm({
                                  ...form,
                                  okrGoals: form.okrGoals.map((g, i) =>
                                    i === index ? { ...g, score: val[0] } : g
                                  ),
                                })
                              }
                              max={100}
                              step={1}
                              disabled={isReadOnly}
                              aria-label={`OKR ${goal.description}`}
                            />
                            <p className="text-sm text-muted-foreground">
                              Score: {goal.score}/100
                            </p>
                            <Textarea
                              placeholder="Add comments about this goal..."
                              value={goal.comment}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  okrGoals: form.okrGoals.map((g, i) =>
                                    i === index
                                      ? { ...g, comment: e.target.value }
                                      : g
                                  ),
                                })
                              }
                              disabled={isReadOnly}
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* 360 Feedback */}
                    <TabsContent value="feedback">
                      <div className="space-y-6">
                        {form.feedback
                          .filter(
                            (fb) =>
                              filterFeedback === "All" ||
                              fb.source === filterFeedback
                          )
                          .map((fb, index) => (
                            <div key={fb.source} className="space-y-2">
                              <Label>{fb.source} Feedback</Label>
                              <Textarea
                                placeholder={`Enter feedback from ${fb.source}...`}
                                value={fb.comment}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    feedback: form.feedback.map((f, i) =>
                                      i === index
                                        ? { ...f, comment: e.target.value }
                                        : f
                                    ),
                                  })
                                }
                                disabled={isReadOnly}
                              />
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    {/* Summary */}
                    <TabsContent value="summary">
                      <div className="space-y-4">
                        <div>
                          <Label>Overall Score</Label>
                          <p className="text-2xl font-bold">
                            {overallScore}/100
                          </p>
                          <Progress value={overallScore} className="mt-2" />
                        </div>
                        <div>
                          <Label>Breakdown</Label>
                          <ul className="list-disc pl-5">
                            <li>
                              Task Completion: {form.taskCompletion} (40%)
                            </li>
                            <li>Work Quality: {form.quality} (30%)</li>
                            <li>Timeliness: {form.timeliness} (30%)</li>
                          </ul>
                        </div>
                        <div>
                          <Label>Overall Comment</Label>
                          <p className="text-muted-foreground">
                            {form.overallComment || "No comment provided"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Summary View</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Overall Score</Label>
                            <p className="text-2xl font-bold">
                              {overallScore}/100
                            </p>
                            <Progress value={overallScore} className="mt-2" />
                          </div>
                          <div>
                            <Label>KPI Breakdown</Label>
                            <ul className="list-disc pl-5">
                              <li>
                                Task Completion: {form.taskCompletion} (40%)
                              </li>
                              <li>Work Quality: {form.quality} (30%)</li>
                              <li>Timeliness: {form.timeliness} (30%)</li>
                            </ul>
                          </div>
                          <div>
                            <Label>OKR Goals</Label>
                            {form.okrGoals.map((goal) => (
                              <p key={goal.id}>
                                {goal.description}: {goal.score}/100
                              </p>
                            ))}
                          </div>
                          <div>
                            <Label>Feedback</Label>
                            {form.feedback
                              .filter(
                                (fb) =>
                                  filterFeedback === "All" ||
                                  fb.source === filterFeedback
                              )
                              .map((fb) => (
                                <p key={fb.source}>
                                  {fb.source}: {fb.comment || "No comment"}
                                </p>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {!isReadOnly && (
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setForm({
                          taskCompletion: 0,
                          quality: 0,
                          timeliness: 0,
                          okrGoals: form.okrGoals.map((g) => ({
                            ...g,
                            score: 0,
                            comment: "",
                          })),
                          feedback: form.feedback.map((f) => ({
                            ...f,
                            comment: "",
                          })),
                          overallComment: "",
                        })
                      }
                    >
                      Reset Form
                    </Button>
                    <Button variant="outline" disabled={isLoading}>
                      Save Draft
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Summary Sidebar */}
            <Card className="w-full md:w-80 md:sticky md:top-20">
              <CardHeader>
                <CardTitle>Score Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Overall Score</Label>
                    <p className="text-xl font-semibold">{overallScore}/100</p>
                    <Progress value={overallScore} />
                  </div>
                  <div>
                    <Label>Breakdown</Label>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Task Completion: {form.taskCompletion} (40%)</li>
                      <li>Work Quality: {form.quality} (30%)</li>
                      <li>Timeliness: {form.timeliness} (30%)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
