"use client";
import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { req } from "@/app/api";
import { useSession } from "next-auth/react";
import { set } from "date-fns";

interface BranchFormData {
  name: string;
  description: string;
  location: string;
  what3words: string;
  created_by: string;
  updated_by: string;
}

export default function BranchFormPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { data: session } = useSession();

  const initialFromData: BranchFormData = {
    name: "",
    description: "",
    location: "",
    what3words: "",
    created_by: session?.user.id || "",
    updated_by: session?.user.id || "",
  };

  const [formData, setFormData] = useState<BranchFormData>(initialFromData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBranchData = async () => {
      if (!id || !session?.user?.token) return;

      try {
        setLoading(true);
        const response = await req.GET(
          `/admin/branches?id=${id}`,
          session?.user.token
        );
        setFormData({
          ...response,
          updated_by: session.user.id || "",
        });
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Салбарын мэдээллийг авахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBranchData();
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
        `/admin/branches/${id || ""}`,
        session?.user?.token || "",
        formData
      );
      if (response) {
        toast({
          title: "Амжилттай",
          description: "Салбар амжилттай засагдлаа!",
        });
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      toast({
        title: "Алдаа",
        description: "Салбарыг засахад алдаа гарлаа",
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
          <CardTitle className="text-2xl">Салбарын мэдээлэл засах</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <Label htmlFor="location">Байршил</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="what3words">What3Words</Label>
                  <Input
                    id="what3words"
                    name="what3words"
                    type="what3words"
                    value={formData.what3words}
                    onChange={handleChange}
                    className={errors.what3words ? "border-red-500" : ""}
                  />
                  {errors.what3words && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.what3words}
                    </p>
                  )}
                </div>
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
