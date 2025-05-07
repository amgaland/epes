"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlus, Table as TableIcon, Download } from "lucide-react";
import { EmployeeTable } from "./components/EmployeeTable";
import { FeedbackModal } from "./components/FeedbackModal";
import { SearchBar } from "./components/SearchBar";
import { useEmployees } from "./hooks/useEmployees";
import {
  sortEmployees,
  filterEmployees,
  exportToCSV,
} from "./utils/employeeUtils";
import { Employee } from "./types";

export default function EmployeePage() {
  const {
    session,
    status,
    isLoading,
    employees,
    setEmployees,
    stats,
    isAdmin,
    isManager,
    router,
    toast,
  } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField] = useState<keyof Employee | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterRole, setFilterRole] = useState<
    "All" | "Employee" | "Manager" | "Admin"
  >("All");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <main className="p-6 flex-1">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-[100px]" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-[60px]" />
                    </CardContent>
                  </Card>
                ))}
            </div>
            <Skeleton className="h-32 w-full mt-6" />
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEmployeeClick = (employeeId: string) => {
    router.push(`/protected/employee/view/${employeeId}`);
  };

  const handleFeedback = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFeedbackModalOpen(true);
    }
  };

  const handleFeedbackSubmit = async (employeeId: string, feedback: string) => {
    try {
      // Simulate API call
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employeeId
            ? {
                ...e,
                feedback: [
                  ...e.feedback,
                  {
                    text: feedback,
                    author: session.user.firstname || "Anonymous",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : e
        )
      );
      toast.toast({
        title: "Feedback Submitted",
        description: "Your feedback has been recorded.",
      });
      setFeedbackModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    }
  };

  const sortedEmployees = sortEmployees(employees, sortField, sortDirection);
  const filteredEmployees = filterEmployees(
    sortedEmployees,
    searchTerm,
    filterRole,
    filterStatus
  );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            setSearchTerm={setSearchTerm}
          />
          {(isAdmin || isManager) && (
            <Button onClick={() => router.push("/protected/employee/create")}>
              <CirclePlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
          {(isAdmin || isManager) && (
            <Button
              variant="outline"
              onClick={() => exportToCSV(filteredEmployees)}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Main Content */}
        <main className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <div className="flex gap-2">
              <Button variant="default" size="icon">
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={filterRole === "All" ? "default" : "outline"}
              onClick={() => setFilterRole("All")}
            >
              All Roles
            </Button>
            <Button
              variant={filterRole === "Employee" ? "default" : "outline"}
              onClick={() => setFilterRole("Employee")}
            >
              Employees
            </Button>
            <Button
              variant={filterRole === "Manager" ? "default" : "outline"}
              onClick={() => setFilterRole("Manager")}
            >
              Managers
            </Button>
            <Button
              variant={filterRole === "Admin" ? "default" : "outline"}
              onClick={() => setFilterRole("Admin")}
            >
              Admins
            </Button>
            <Button
              variant={filterStatus === "All" ? "default" : "outline"}
              onClick={() => setFilterStatus("All")}
            >
              All Statuses
            </Button>
            <Button
              variant={filterStatus === "Active" ? "default" : "outline"}
              onClick={() => setFilterStatus("Active")}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === "Inactive" ? "default" : "outline"}
              onClick={() => setFilterStatus("Inactive")}
            >
              Inactive
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="shadow-sm">
              <CardHeader className="text-sm font-medium">
                Total Employees
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {isLoading ? (
                  <Skeleton className="h-8 w-[60px]" />
                ) : (
                  stats.totalEmployees
                )}
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="text-sm font-medium">
                Total Managers
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {isLoading ? (
                  <Skeleton className="h-8 w-[60px]" />
                ) : (
                  stats.totalManagers
                )}
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="text-sm font-medium">
                Active Employees
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {isLoading ? (
                  <Skeleton className="h-8 w-[60px]" />
                ) : (
                  stats.activeEmployees
                )}
              </CardContent>
            </Card>
          </div>

          {/* Employee List */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Employee List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No employees found.
                  </p>
                  {(isAdmin || isManager) && (
                    <Button
                      onClick={() => router.push("/protected/employee/create")}
                    >
                      <CirclePlus className="mr-2 h-4 w-4" />
                      Add Employee
                    </Button>
                  )}
                </div>
              ) : (
                <EmployeeTable
                  employees={filteredEmployees}
                  handleSort={handleSort}
                  handleEmployeeClick={handleEmployeeClick}
                  handleFeedback={handleFeedback}
                  isAdmin={isAdmin}
                  isManager={isManager}
                />
              )}
            </CardContent>
          </Card>
        </main>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSubmit={handleFeedbackSubmit}
        />
      </div>
    </div>
  );
}
