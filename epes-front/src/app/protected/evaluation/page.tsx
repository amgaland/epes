"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Download, RefreshCw, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EvaluationStats from "./components/EvaluationStats";
import EvaluationTable from "./components/EvaluationTable";
import SubmitScoreForm from "./components/SubmitScoreForm";
import { EvaluationService, Evaluation, User, KPIScore } from "./lib/api";

interface EvaluationStat {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface FilterStatus {
  label: string;
  value: "All" | "Excellent" | "Good" | "Needs Improvement";
}

export default function EvaluationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [stats, setStats] = useState<EvaluationStat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<FilterStatus["value"]>("All");
  const [sortField, setSortField] = useState<keyof KPIScore | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const calculateStats = useCallback((evalData: Evaluation) => {
    const excellentScores = evalData.kpi_scores.filter(
      (s) => s.score >= 90
    ).length;
    const goodScores = evalData.kpi_scores.filter(
      (s) => s.score >= 70 && s.score < 90
    ).length;
    const needsImprovement = evalData.kpi_scores.filter(
      (s) => s.score < 70
    ).length;
    const avgScore =
      evalData.kpi_scores.length > 0
        ? evalData.kpi_scores.reduce((sum, s) => sum + s.score, 0) /
          evalData.kpi_scores.length
        : 0;

    return [
      { title: "Excellent", value: excellentScores, icon: RefreshCw },
      { title: "Good", value: goodScores, icon: RefreshCw },
      { title: "Needs Improvement", value: needsImprovement, icon: RefreshCw },
      { title: "Average Score", value: Math.round(avgScore), icon: RefreshCw },
    ];
  }, []);

  const debouncedSearch = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setSearchTerm(value), 300);
    };
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const fetchData = useCallback(async () => {
    if (!session?.user?.token) {
      console.error("No token available");
      toast({
        title: "Error",
        description: "Please log in to continue",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    try {
      setIsLoading(true);
      const userData = await EvaluationService.getUser(session.user.token);
      console.log("Fetched user:", userData);
      setUser(userData);

      let usersData: User[] = [];
      if (["admin", "manager", "hr"].includes(userData.role)) {
        usersData = await EvaluationService.getUsers(session.user.token);
        console.log("Fetched users:", usersData);
      }
      setUsers(usersData);

      const initialEmployeeId =
        userData.role === "employee" ? userData.id : usersData[0]?.id || "";
      setSelectedEmployeeId(initialEmployeeId);

      if (initialEmployeeId) {
        const evalData = await EvaluationService.getScores(
          initialEmployeeId,
          session.user.token
        );
        console.log("Fetched evaluation:", evalData);
        setEvaluation(evalData);
        setStats(calculateStats(evalData));
      } else {
        console.warn("No initial employee ID set");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats, toast, router, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, fetchData]);

  const handleEmployeeChange = async (value: string) => {
    setSelectedEmployeeId(value);
    try {
      setIsLoading(true);
      const evalData = await EvaluationService.getScores(
        value,
        session!.user!.token
      );
      console.log("Fetched evaluation for employee:", value, evalData);
      setEvaluation(evalData);
      setStats(calculateStats(evalData));
    } catch (err) {
      console.error("Employee change error:", err);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = useCallback(
    (field: keyof KPIScore) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  const handleExport = useCallback(() => {
    if (!evaluation) return;
    const csv = [
      ["Employee ID", "Metric", "Score", "Weight"],
      ...evaluation.kpi_scores.map((s) => [
        s.employee_id,
        s.metric.name,
        s.score,
        s.metric.weight,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evaluation_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [evaluation]);

  const handleCreateEvaluation = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
    fetchData();
  };

  const filteredScores = useMemo(() => {
    if (!evaluation) return [];
    let scores = evaluation.kpi_scores;
    if (searchTerm) {
      scores = scores.filter((s) =>
        s.metric.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "All") {
      scores = scores.filter((s) => {
        if (filterStatus === "Excellent") return s.score >= 90;
        if (filterStatus === "Good") return s.score >= 70 && s.score < 90;
        if (filterStatus === "Needs Improvement") return s.score < 70;
        return true;
      });
    }
    if (sortField) {
      scores = [...scores].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }
    return scores;
  }, [evaluation, searchTerm, filterStatus, sortField, sortDirection]);

  if (status === "loading") {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Please log in to view evaluations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canSubmitScores = ["admin", "manager", "hr"].includes(user.role);
  const canSelectEmployee = ["admin", "manager", "hr"].includes(user.role);
  const canCreateEvaluation = ["admin", "manager"].includes(user.role);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Evaluations</CardTitle>
            {canCreateEvaluation && (
              <Button
                onClick={handleCreateEvaluation}
                disabled={showCreateForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Evaluation
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && canCreateEvaluation && (
            <SubmitScoreForm
              employeeId={selectedEmployeeId}
              token={session!.user!.token}
              onClose={handleCloseCreateForm}
            />
          )}
          {canSelectEmployee && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select Employee
              </label>
              <Select
                onValueChange={handleEmployeeChange}
                value={selectedEmployeeId}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search metrics..."
                className="pl-8"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                onClick={handleExport}
                disabled={isLoading || !evaluation}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={fetchData} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                "All",
                "Excellent",
                "Good",
                "Needs Improvement",
              ] as FilterStatus["value"][]
            ).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          <EvaluationStats stats={stats} isLoading={isLoading} />
          <div className="mt-6">
            <EvaluationTable
              scores={filteredScores}
              onSort={handleSort}
              isLoading={isLoading}
            />
          </div>
          {canSubmitScores && !showCreateForm && (
            <SubmitScoreForm
              employeeId={selectedEmployeeId}
              token={session!.user!.token}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
