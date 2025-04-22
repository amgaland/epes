"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { req } from "@/app/api";
import { useSession } from "next-auth/react";

interface DepartmentFormData {
  name: string;
}

export default function DepartmentFormPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log("department id", id);
  const router = useRouter();
  const { data: session } = useSession();

  const initialFromData: DepartmentFormData = {
    name: "",
  };

  const [formData, setFormData] = useState<DepartmentFormData>(initialFromData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (!id || !session?.user?.token) return;

      try {
        setLoading(true);
        const response = await req.GET(
          `/protected/departments?id=${id}`,
          session?.user.token
        );
        setFormData({
          ...response,
          updated_by: session.user.id || "",
        });
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Department мэдээллийг авахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentData();
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
        `/protected/departments/${id || ""}`,
        session?.user?.token || "",
        formData
      );

      if (response) {
        toast({
          title: "Success",
          description: "Department created successfully!",
        });
        router.push("/protected/department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await req.DELETE(
        `/protected/departments/${id}`,
        session?.user?.token || ""
      );

      if (response) {
        toast({
          title: "Success",
          description: "Department deleted successfully!",
        });
        router.push("/protected/department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {id ? "Department Засах" : "Department Add"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
                disabled={loading}
                placeholder="Department-ийн нэрийг оруулна уу"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Боловсруулж байна..." : id ? "Хадгалах" : "Add"}
            </Button>
            {id && (
              <Dialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Устгаж байна..." : "Устгах"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Department-ийг устгах уу?</DialogTitle>
                    <DialogDescription>
                      Та энэ department-ийг устгахдаа итгэлтэй байна уу? Энэ
                      үйлдлийг буцаах боломжгүй.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpenDeleteDialog(false)}
                      disabled={loading}
                    >
                      Болих
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {loading ? "Устгаж байна..." : "Устгах"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
