"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Header } from "@/components/header";
import { useRequireAuth } from "@/lib/checkAuth";
import { BarChart2, FileText, Users, Award } from "lucide-react";

export default function Home() {
  useRequireAuth();
  const router = useRouter();
  const { data: session } = useSession();
  const roles = session?.user.roles || []; // Default to empty array if undefined
  const isAdmin = roles.includes("admin"); // Check if "admin" is in roles
  const [isLoading, setIsLoading] = useState(false);

  // Admin (HR/Manager) specific cards
  const adminCards = [
    {
      alt: "evaluate-employee",
      src: "/icons/evaluate.png",
      label: "Evaluate Employee",
      route: "/evaluation/new",
      icon: <FileText />,
    },
    {
      alt: "view-reports",
      src: "/icons/reports.png",
      label: "View Reports",
      route: "/reports",
      icon: <BarChart2 />,
    },
    {
      alt: "manage-employees",
      src: "/icons/users.png",
      label: "Manage Employees",
      route: "/employees",
      icon: <Users />,
    },
  ];

  // Employee-specific cards
  const employeeCards = [
    {
      alt: "view-evaluation",
      src: "/icons/my-eval.png",
      label: "My Evaluations",
      route: "/employee/evaluations",
      icon: <FileText />,
    },
    {
      alt: "performance-stats",
      src: "/icons/stats.png",
      label: "Performance Stats",
      route: "/employee/stats",
      icon: <BarChart2 />,
    },
    {
      alt: "achievements",
      src: "/icons/achievements.png",
      label: "Achievements",
      route: "/employee/achievements",
      icon: <Award />,
    },
  ];

  // Determine which cards to show based on role
  const displayCards = isAdmin ? adminCards : employeeCards;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {isAdmin
                ? "Performance Management Dashboard"
                : "My Performance Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isAdmin
                ? "Manage employee evaluations and track performance."
                : "View your performance evaluations and achievements."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayCards.map((card) => (
              <Card
                key={card.alt}
                onClick={() => router.push(card.route)}
                className="cursor-pointer flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 text-gray-700 dark:text-gray-200">
                  {card.icon}
                </div>
                <Image
                  className="rounded-full p-1 bg-gray-200 dark:bg-gray-700"
                  alt={card.alt}
                  src={card.src}
                  width={50}
                  height={50}
                />
                <span className="mt-4 font-semibold text-gray-800 dark:text-white">
                  {card.label}
                </span>
              </Card>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-10 text-center">
              <Button
                onClick={() => router.push("/admin/export")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Performance Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
