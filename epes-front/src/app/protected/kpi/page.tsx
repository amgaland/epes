"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  lastEvaluated: string | null;
  averageScore: number | null;
}

interface KPI {
  id: string;
  name: string;
  description: string;
  score?: number; // 1-5
}

interface Evaluation {
  employeeId: string;
  kpis: KPI[];
  comments: string;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    role: "Developer",
    department: "Engineering",
    lastEvaluated: "2025-02-15",
    averageScore: 4.2,
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Designer",
    department: "Design",
    lastEvaluated: "2025-01-20",
    averageScore: 4.5,
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "Manager",
    department: "Operations",
    lastEvaluated: null,
    averageScore: null,
  },
];

const mockKPIs: KPI[] = [
  {
    id: "1",
    name: "Productivity",
    description: "Meets deadlines and output goals",
  },
  {
    id: "2",
    name: "Quality of Work",
    description: "Delivers high-quality results",
  },
  { id: "3", name: "Attendance", description: "Consistency in attendance" },
  { id: "4", name: "Team Collaboration", description: "Works well with team" },
];

const EmployeeEvaluationPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [kpiScores, setKpiScores] = useState<KPI[]>(mockKPIs);
  const [comments, setComments] = useState("");

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
            <Skeleton className="h-32 w-full" />
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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const filteredEmployees = mockEmployees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm)
  );

  const handleScoreChange = (kpiId: string, score: number) => {
    setKpiScores((prev) =>
      prev.map((kpi) => (kpi.id === kpiId ? { ...kpi, score } : kpi))
    );
  };

  const handleSubmitEvaluation = () => {
    if (!selectedEmployee) return;
    const evaluation: Evaluation = {
      employeeId: selectedEmployee.id,
      kpis: kpiScores,
      comments,
    };
    console.log("Evaluation Submitted:", evaluation);
    // Here you would typically send this to an API
    setSelectedEmployee(null);
    setKpiScores(mockKPIs.map((kpi) => ({ ...kpi, score: undefined })));
    setComments("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Search */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search employees..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
        </div>

        <main className="p-6 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Employee KPI Evaluation
          </h1>

          {/* Employee List */}
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Evaluated</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.name}
                        </TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>
                          {employee.lastEvaluated || "Not yet evaluated"}
                        </TableCell>
                        <TableCell>
                          {employee.averageScore ? (
                            <Badge variant="secondary">
                              {employee.averageScore.toFixed(1)} / 5
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedEmployee(employee)}
                              >
                                Evaluate
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Evaluate {selectedEmployee?.name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {kpiScores.map((kpi) => (
                                  <div key={kpi.id} className="space-y-2">
                                    <Label>{kpi.name}</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {kpi.description}
                                    </p>
                                    <div className="flex gap-2">
                                      {[1, 2, 3, 4, 5].map((score) => (
                                        <Button
                                          key={score}
                                          variant={
                                            kpi.score === score
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            handleScoreChange(kpi.id, score)
                                          }
                                        >
                                          <Star
                                            className="h-4 w-4"
                                            fill={
                                              kpi.score && kpi.score >= score
                                                ? "currentColor"
                                                : "none"
                                            }
                                          />
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                <div className="space-y-2">
                                  <Label>Comments</Label>
                                  <Textarea
                                    value={comments}
                                    onChange={(e) =>
                                      setComments(e.target.value)
                                    }
                                    placeholder="Add your comments here..."
                                  />
                                </div>
                                <Button
                                  onClick={handleSubmitEvaluation}
                                  disabled={
                                    !kpiScores.every(
                                      (kpi) => kpi.score !== undefined
                                    )
                                  }
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Submit Evaluation
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default EmployeeEvaluationPage;
