// app/protected/employee/create/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CreateEmployeePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    loginID: "",
    emailWork: "",
    role: "Employee",
  });

  if (
    status === "unauthenticated" ||
    !session ||
    !["Admin", "Manager"].some((r) => session.user.roles.includes(r))
  ) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "Active" }),
      });
      if (!response.ok) throw new Error("Failed to create employee");
      toast({ title: "Success", description: "Employee created." });
      router.push("/protected/employee");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create employee.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <Input
            placeholder="Login ID"
            value={form.loginID}
            onChange={(e) => setForm({ ...form, loginID: e.target.value })}
          />
          <Input
            placeholder="Work Email"
            value={form.emailWork}
            onChange={(e) => setForm({ ...form, emailWork: e.target.value })}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border rounded p-2 w-full"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <Button type="submit">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
}
