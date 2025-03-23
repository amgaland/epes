"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Employee, ApiResponse, Evaluations } from "../types/evaluation";
import { toast } from "@/hooks/use-toast";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const token = session?.user.token;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8088/admin/evaluations";

  useEffect(() => {
    if (status === "authenticated" && token) {
      setIsLoading(true);
      fetch(API_BASE_URL, {
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
        .then((response: ApiResponse<Evaluations>) => {
          if (response.error) throw new Error(response.error);
          setEmployees(response.data?.employees || []);
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
  }, [status, token]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Manager Dashboard
      </h1>
      {employees.length === 0 ? (
        <p className="text-gray-500">No employees found.</p>
      ) : (
        <div className="space-y-4">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-gray-50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-700">
                {emp.name} ({emp.role})
              </h2>
              <p>
                KPI: {emp.kpi.target} - Achieved: {emp.kpi.achieved} (
                {emp.kpi.status})
              </p>
              <p>
                OKR: {emp.okr.objective} - Progress: {emp.okr.progress}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
