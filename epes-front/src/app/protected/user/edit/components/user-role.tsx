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

interface UserRoleProps {
  user: UserProps;
  roles: RolesProps[];
}

interface RolesProps {
  id: string;
  name: string;
  active: boolean;
}

interface UserProps {
  id: string;
  first_name: string;
}

const UserRole = ({ userId }: { userId?: string }) => {
  const { data: session } = useSession();
  const initialFormData: UserRoleProps = {
    user: {
      id: "",
      first_name: "",
    },
    roles: [
      {
        id: "",
        name: "",
        active: false,
      },
    ],
  };
  const [userRoles, setUserRoles] = useState<UserRoleProps>(initialFormData);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!userId || !session?.user.token) return;

      try {
        const response = await req.GET(
          `/protected/user/roles/list?user_id=${userId}`,
          session.user.token
        );
        setUserRoles(response);
      } catch (err: any) {
        toast({
          title: "Алдаа гарлаа.",
        });
      }
    };
    fetchUserRoles();
  }, [userId, session]);

  const handleUpdateRoles = async () => {
    if (!session?.user?.token || !userId || !userRoles?.roles?.length) {
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
      for (const { id, active } of userRoles.roles) {
        if (!id || active === undefined) {
          return;
        }

        await req.PUT(
          `/protected/user/roles/update`,
          session.user.token,
          JSON.stringify({
            active: active === true,
            role_id: id,
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
      console.error("Error while updating roles:", err);
      toast({
        title: "Алдаа гарлаа.",
        description: "Хадгалах явцад алдаа гарлаа.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="border py-2 px-4 rounded-2xl">Ажилтаны эрх</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ажилтаны эрх</DialogTitle>
        </DialogHeader>
        <div>
          {userRoles?.roles && userRoles.roles.length > 0 ? (
            <>
              <div>Нэр: {userRoles?.user?.first_name}</div>
              {userRoles.roles.map((role: RolesProps) => (
                <div className="flex space-x-2 items-center" key={role.id}>
                  <Checkbox
                    checked={role.active}
                    onCheckedChange={() => {
                      const updatedRoles = userRoles.roles.map((e) =>
                        e.id === role.id ? { ...e, active: !e.active } : e
                      );

                      setUserRoles((prevState) => ({
                        ...prevState,
                        roles: updatedRoles,
                      }));
                    }}
                  />
                  <div>{role.name}</div>
                </div>
              ))}
            </>
          ) : (
            <>ROLE NOT FOUND</>
          )}
        </div>
        <Button onClick={handleUpdateRoles}>Засах</Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserRole;
