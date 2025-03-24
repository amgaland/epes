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

interface ActionFormData {
  name: string;
  description: string;
  created_by: string;
  updated_by: string;
}

export default function UserCreatePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { data: session } = useSession();

  const initialFromData: ActionFormData = {
    name: "",
    description: "",
    created_by: session?.user.id || "",
    updated_by: session?.user.id || "",
  };

  const [formData, setFormData] = useState<ActionFormData>(initialFromData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchActionData = async () => {
      if (!id || !session?.user?.token) return;

      try {
        setLoading(true);
        const response = await req.GET(
          `/admin/action-types?id=${id}`,
          session?.user?.token
        );
        setFormData({
          ...response,
          updated_by: session.user.id || "",
        });
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Үйлдлийн мэдээллийг авахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchActionData();
  }, [id, session?.user?.id, session?.user?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await req.PUT(
        `/admin/action-types/${id || ""}`,
        session?.user?.token || "",
        formData
      );
      if (response) {
        toast({
          title: "Амжилттай",
          description: "Үйлдэл амжилттай засагдлаа!",
        });
        router.push("/admin/action-types");
      }
    } catch (error) {
      console.error("Error updating action:", error);
      toast({
        title: "Алдаа",
        description: "Үйлдлийг засахад алдаа гарлаа",
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
          <CardTitle className="text-2xl">Шинэ үйлдэл нэмэх</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-x-2 w-full grid-cols-2">
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
              <div>
                <Label htmlFor="description">Тайлбар</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Уншиж байна..." : id ? "Хадгалах" : "Нэмэх"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
