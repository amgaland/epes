"use client";
import React, { useState, useEffect } from "react";
import { req } from "@/app/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";

interface UserDepartmentProps {
  user: UserProps;
  departments: DepartmentsProps[];
}

interface DepartmentsProps {
  id: string;
  name: string;
  active: boolean;
}

interface UserProps {
  id: string;
  first_name: string;
}

const UserDepartment = ({ userId }: { userId?: string }) => {
  const { data: session } = useSession();
  const initialFormData: UserDepartmentProps = {
    user: {
      id: "",
      first_name: "",
    },
    departments: [
      {
        id: "",
        name: "",
        active: false,
      },
    ],
  };
  const [userDepartments, setUserDepartments] =
    useState<UserDepartmentProps>(initialFormData);

  useEffect(() => {
    const fetchUserDepartments = async () => {
      if (!userId || !session?.user.token) return;

      try {
        const response = await req.GET(
          `/protected/user/departments/list?user_id=${userId}`,
          session.user.token
        );
        setUserDepartments(response);
      } catch (err: any) {
        toast({
          title: "Алдаа гарлаа.",
        });
      }
    };
    fetchUserDepartments();
  }, [userId, session]);

  const handleUpdateDepartments = async () => {
    if (
      !session?.user?.token ||
      !userId ||
      !userDepartments?.departments?.length
    ) {
      toast({
        title: "Алдаа гарлаа.",
        description:
          !session?.user?.token || !userId
            ? "Нэвтэрсэн хэрэглэгчийн эрх байхгүй эсвэл хэрэглэгчийн ID олдсонгүй."
            : "Ролийн мэдээлэл байхгүй байна.",
      });
      return;
    }

    try {
      for (const { id, active } of userDepartments.departments) {
        if (!id || active === undefined) {
          return;
        }

        await req.PUT(
          `/protected/user/departments/update`,
          session.user.token,
          JSON.stringify({
            active: active === true,
            department_id: id,
            user_id: userId,
            created_by: session.user.id,
            updated_by: session.user.id,
          })
        );
      }

      toast({
        title: "Амжилттай хадгаллаа.",
        description: "Ролийн мэдээлэл амжилттай шинэчлэгдлээ.",
      });
    } catch (err) {
      console.error("Error while updating departments:", err);
      toast({
        title: "Алдаа гарлаа.",
        description: "Хадгалах явцад алдаа гарлаа.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="border py-2 px-4 rounded-2xl">Ажилтаны хэлтэс</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ажилтаны эрх</DialogTitle>
        </DialogHeader>
        <div>
          {userDepartments?.departments &&
          userDepartments.departments.length > 0 ? (
            <>
              <div>Нэр: {userDepartments?.user?.first_name}</div>
              {userDepartments.departments.map(
                (department: DepartmentsProps) => (
                  <div
                    className="flex space-x-2 items-center"
                    key={department.id}
                  >
                    <Checkbox
                      checked={department.active}
                      onCheckedChange={() => {
                        const updatedDepartments =
                          userDepartments.departments.map((e) =>
                            e.id === department.id
                              ? { ...e, active: !e.active }
                              : e
                          );

                        setUserDepartments((prevState) => ({
                          ...prevState,
                          departments: updatedDepartments,
                        }));
                      }}
                    />
                    <div>{department.name}</div>
                  </div>
                )
              )}
            </>
          ) : (
            <>ROLE NOT FOUND</>
          )}
        </div>
        <Button onClick={handleUpdateDepartments}>Засах</Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserDepartment;
