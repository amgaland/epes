"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { req } from "@/app/api";
import { useSession } from "next-auth/react";

export default function UserCreatePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    created_by: session?.user.id || "",
    updated_by: session?.user.id || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!session?.user.token) return;

    try {
      const response = await req.POST("/admin/roles", session?.user.token, formData);

      if (response) {
        toast({ title: "Success", description: "Role created successfully!" });
        router.push("/admin/role");
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  return (
    <div className="py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Шинэ role нэмэх</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <Label htmlFor="name">Нэр</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <Button type="submit" className="w-full">
              Үүсгэх
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
