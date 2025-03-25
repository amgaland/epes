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
import { DatePickerWithRange } from "@/components/date-range-picker";
import UserRole from "./components/user-role";

interface UserFormData {
  first_name: string;
  last_name: string;
  login_id: string;
  email_work: string;
  email_personal: string;
  phone_number_work: string;
  phone_number_personal: string;
  is_active: boolean;
  active_start_date: string;
  active_end_date: string;
  password?: string;
  created_by: string;
  updated_by: string;
}

export default function UserFormPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { data: session } = useSession();

  const initialFormData: UserFormData = {
    first_name: "",
    last_name: "",
    login_id: "",
    email_work: "",
    email_personal: "",
    phone_number_work: "",
    phone_number_personal: "",
    is_active: false,
    active_start_date: "",
    active_end_date: "",
    password: "",
    created_by: session?.user?.id || "",
    updated_by: session?.user?.id || "",
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || !session?.user?.token) return;

      try {
        setLoading(true);
        const response = await req.GET(
          `/protected/users?id=${id}`,
          session.user.token
        );
        setFormData({
          ...response,
          updated_by: session.user.id || "",
        });
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
        `/protected/users/${id || ""}`,
        session?.user?.token || "",
        {
          ...formData,
          active_start_date: formData.active_start_date || null,
          active_end_date: formData.active_end_date || null,
        }
      );

      if (response) {
        toast({
          title: "Амжилттай",
          description: "Мэдээлэл шинэчлэгдлээ",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Алдаа",
        description: "Гэнэтийн алдаа гарлаа",
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
          <CardTitle className="text-2xl">
            {id ? "Хэрэглэгч засах" : "Шинэ хэрэглэгч нэмэх"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Хувийн мэдээлэл</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Нэр</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={errors.first_name ? "border-red-500" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Овог</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={errors.last_name ? "border-red-500" : ""}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="login_id">Нэвтрэх ID</Label>
                  <Input
                    id="login_id"
                    name="login_id"
                    type="text"
                    value={formData.login_id}
                    onChange={handleChange}
                    className={errors.login_id ? "border-red-500" : ""}
                  />
                  {errors.login_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.login_id}
                    </p>
                  )}
                </div>
                {!id && (
                  <div>
                    <Label htmlFor="password">Нууц үг</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Холбоо барих</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email_work">Ажлын имэйл</Label>
                  <Input
                    id="email_work"
                    name="email_work"
                    type="email"
                    value={formData.email_work}
                    onChange={handleChange}
                    className={errors.email_work ? "border-red-500" : ""}
                  />
                  {errors.email_work && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email_work}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email_personal">Хувийн имэйл</Label>
                  <Input
                    id="email_personal"
                    name="email_personal"
                    type="email"
                    value={formData.email_personal}
                    onChange={handleChange}
                    className={errors.email_personal ? "border-red-500" : ""}
                  />
                  {errors.email_personal && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email_personal}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone_number_work">Ажлын дугаар</Label>
                  <Input
                    id="phone_number_work"
                    name="phone_number_work"
                    type="tel"
                    value={formData.phone_number_work}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number_personal">Хувийн дугаар</Label>
                  <Input
                    id="phone_number_personal"
                    name="phone_number_personal"
                    type="tel"
                    value={formData.phone_number_personal}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Төлөв</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <Label htmlFor="is_active">Идэвхтэй эсэх</Label>
                </div>
                <div className="space-x-2">
                  <Label>Ажиллах хугацаа:</Label>
                  <DatePickerWithRange
                    value={{
                      from: formData.active_start_date
                        ? new Date(formData.active_start_date)
                        : undefined,
                      to: formData.active_end_date
                        ? new Date(formData.active_end_date)
                        : undefined,
                    }}
                    onChange={(date) => {
                      setFormData((prev) => ({
                        ...prev,
                        active_start_date: date?.from
                          ? date.from.toISOString()
                          : "",
                        active_end_date: date?.to ? date.to.toISOString() : "",
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
            <UserRole userId={id!} />
            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Уншиж байна..." : id ? "Засах" : "Нэмэх"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
