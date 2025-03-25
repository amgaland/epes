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
import { DatePickerWithRange } from "@/components/date-range-picker";

interface DateRange {
  range: {
    from: string;
    to: string;
  };
}

export default function UserCreatePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    login_id: "",
    email_work: "",
    email_personal: "",
    phone_number_work: "",
    phone_number_personal: "",
    is_active: false,
    active_start_date: new Date().toISOString(),
    active_end_date: new Date().toISOString(),
    password: "",
    created_by: session?.user?.id || "",
    updated_by: session?.user?.id || "",
  });

  const [loginIdExists, setLoginIdExists] = useState<boolean | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "login_id") {
      if (!value.trim()) {
        setLoginIdExists(null);
        return;
      }

      try {
        if (!session?.user?.token) {
          console.error("Session token is missing.");
          return;
        }

        const response = await fetch(
          `http://localhost:8088/protected/users/check-login-id?login_id=${value}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check login ID");
        }

        const data = await response.json();
        setLoginIdExists(data.exists);
      } catch (error) {
        console.error("Error checking login ID:", error);
        setLoginIdExists(null);
      }
    }
  };

  const handleDateChange = (values: DateRange) => {
    setFormData((prevData) => ({
      ...prevData,
      active_start_date: values.range.from,
      active_end_date: values.range.to,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.login_id ||
      !formData.password
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user?.token) {
      toast({
        title: "Error",
        description: "Session token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await req.POST(
        "/protected/users",
        session.user.token,
        formData
      );

      if (response) {
        toast({ title: "Success", description: "User created successfully!" });
        router.push("/protected/user");
      } else {
        const errorData = response?.data || {};

        if (errorData.error === "user already exists") {
          toast({
            title: "Error",
            description: "Login ID already exists. Please choose another one.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData.message || "Failed to create user",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status:", error.response.status);
        toast({
          title: "Error",
          description:
            error.response.data?.message ||
            "An unexpected error occurred on the server",
          variant: "destructive",
        });
      } else {
        console.error("Network or client-side error:", error);
        toast({
          title: "Error",
          description: "Network or client-side error occurred",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Шинэ хэрэглэгч нэмэх</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Хувийн мэдээлэл</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name">Нэр</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Овог</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login_id">Нэвтрэх ID</Label>
                  <Input
                    id="login_id"
                    name="login_id"
                    type="text"
                    value={formData.login_id}
                    onChange={handleChange}
                    required
                  />
                  {loginIdExists !== null && (
                    <p
                      className={`text-sm ${loginIdExists ? "text-red-500" : "text-green-500"}`}
                    >
                      {loginIdExists
                        ? "Login ID already exists."
                        : "Login ID is available."}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Нууц үг</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Холбоо барих</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email_work">Ажлын имэйл</Label>
                  <Input
                    id="email_work"
                    name="email_work"
                    type="email"
                    value={formData.email_work}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email_personal">Хувийн имэйл</Label>
                  <Input
                    id="email_personal"
                    name="email_personal"
                    type="email"
                    value={formData.email_personal}
                    onChange={handleChange}
                  />
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

            {/* Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Төлөв</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center space-x-4">
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
                      from: new Date(formData.active_start_date),
                      to: new Date(formData.active_end_date),
                    }}
                    onChange={(range) => {
                      if (range?.from && range?.to) {
                        handleDateChange({
                          range: {
                            from: range.from.toISOString(),
                            to: range.to.toISOString(),
                          },
                        });
                      }
                    }}
                  />
                </div>
              </div>
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
