"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LottiePlayer from "@/components/lottie-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/lib/checkAuth";
import loading from "@/../public/lottie/round-loading.json";
import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Header } from "@/components/header";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import ManagerDashboard from "@/components/ManagerDashboard";
import FeedbackForm from "@/components/FeedbackForm";
import { Employee, ApiResponse, Evaluations } from "@/types/evaluation";

export default function Home() {
  useRequireAuth(); // Enforce authentication
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user.token;
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:8088/admin/evaluations"; // Golang backend endpoint

  // Fetch employee data on mount
  useEffect(() => {
    if (status === "authenticated" && token) {
      setIsLoading(true);
      fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // Use token for API auth
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
          console.error("Fetch Error:", err);
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

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter an employee ID or name to search.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}?search=${encodeURIComponent(inputValue)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const data: ApiResponse<Evaluations> = await response.json();
      if (data.error) throw new Error(data.error);
      setEmployees(data.data?.employees || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Search Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LottiePlayer animation={loading} width={100} height={100} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <p className="text-center">Please log in to access this page.</p>;
  }

  return (
    <>
      <Header />
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center border-b border-gray-300 pb-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Admin Performance Dashboard
              </h1>
            </div>

            {/* Search Bar */}
            <div className="mt-6 w-full max-w-md flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by employee ID or name..."
                className="dark:bg-gray-800 dark:text-white"
                disabled={isLoading}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Error Display */}
            {error && <p className="text-red-500 mt-4">Error: {error}</p>}

            {/* Performance Evaluation Components */}
            <div className="mt-8 w-full">
              {/* Manager Dashboard */}
              <div className="mb-8">
                <ManagerDashboard />
              </div>

              {/* Employee Dashboard (Example for first employee) */}
              {employees.length > 0 && (
                <div className="mb-8">
                  <EmployeeDashboard employeeId={employees[0].id} />
                </div>
              )}

              {/* Feedback Form (Example for first employee) */}
              {employees.length > 0 && (
                <div>
                  <FeedbackForm employeeId={employees[0].id} />
                </div>
              )}
            </div>

            {/* Optional Admin Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 font-bold">
              {[
                {
                  alt: "settings",
                  src: "/icons/settings.png",
                  label: "Settings",
                  route: "/admin/settings",
                },
                {
                  alt: "reports",
                  src: "/icons/reports.png",
                  label: "Generate Reports",
                  route: "/admin/reports",
                },
              ].map((card) => (
                <Card
                  key={card.alt}
                  onClick={() => router.push(card.route)}
                  className="cursor-pointer flex flex-col items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Image
                    className="bg-black rounded-full p-1"
                    alt={card.alt}
                    src={card.src}
                    width={40}
                    height={40}
                  />
                  <span className="text-gray-800 dark:text-white">
                    {card.label}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
