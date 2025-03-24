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

  return (
    <>
      <Header />
    </>
  );
}
