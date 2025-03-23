"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Employee, ApiResponse } from "../types/evaluation";
import { toast } from "@/hooks/use-toast";

interface Props {
  employeeId: number;
}

export default function EmployeeDashboard({ employeeId }: Props) {
  const { data: session, status } = useSession();
  const token = session?.user.token;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8088/admin/evaluations";

  useEffect(() => {
    if (status === "authenticated" && token) {
      setIsLoading(true);
      fetch(`${API_BASE_URL}?search=${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`HTTP ${res.status}: ${text}`);
            });
          }
          return res.json();
        })
        .then((response: ApiResponse<{ employees: Employee[] }>) => {
          if (response.error) throw new Error(response.error);
          const emp = response.data?.employees.find((e) => e.id === employeeId);
          setEmployee(emp || null);
        })
        .catch((err) => {
          setError(err.message);
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [status, token, employeeId]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!employee) return <p>No employee data found.</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Welcome, {employee.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">KPI</h2>
          <p>Target: {employee.kpi.target}</p>
          <p>Achieved: {employee.kpi.achieved}</p>
          <p
            className={`text-sm ${
              employee.kpi.status === "completed"
                ? "text-green-500"
                : employee.kpi.status === "behind"
                  ? "text-red-500"
                  : "text-yellow-500"
            }`}
          >
            Status: {employee.kpi.status}
          </p>
        </div>
        {/* OKR */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">OKR</h2>
          <p>Objective: {employee.okr.objective}</p>
          <ul className="list-disc pl-5">
            {employee.okr.keyResults.map((kr, idx) => (
              <li key={idx} className="text-gray-600">
                {kr}
              </li>
            ))}
          </ul>
          <p>Progress: {employee.okr.progress}%</p>
        </div>
        {/* 360 Feedback */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">360 Feedback</h2>
          {employee.feedback.length > 0 ? (
            <ul className="list-disc pl-5">
              {employee.feedback.map((fb, idx) => (
                <li key={idx} className="text-gray-600">
                  {fb}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No feedback yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
