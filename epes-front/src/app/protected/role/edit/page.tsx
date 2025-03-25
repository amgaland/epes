"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { req } from "@/app/api";
import { useSession } from "next-auth/react";
import UserRole from "./components/rolePermission";
import RolePermission from "./components/rolePermission";

interface RoleFormData {
  name: string;
}

export default function RoleFormPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log("role id", id);
  const router = useRouter();
  const { data: session } = useSession();

  const initialFromData: RoleFormData = {
    name: "",
  };

  const [formData, setFormData] = useState<RoleFormData>(initialFromData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!id || !session?.user?.token) return;

      try {
        setLoading(true);
        const response = await req.GET(
          `/protected/roles?id=${id}`,
          session?.user.token
        );
        setFormData({
          ...response,
          updated_by: session.user.id || "",
        });
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Role мэдээллийг авахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRoleData();
  }, [id, session?.user?.id, session?.user?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await req.PUT(
        `/protected/roles/${id || ""}`,
        session?.user?.token || "",
        formData
      );

      if (response) {
        toast({ title: "Success", description: "Role created successfully!" });
        router.push("/protected/roles");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl"> Role Засах</CardTitle>
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
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <RolePermission roleID={id!} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Уншиж байна..." : id ? "Хадгалах" : "Нэмэх"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
