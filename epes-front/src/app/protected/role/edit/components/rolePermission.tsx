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
import { useSession } from "next-auth/react";

interface RolePermissionProps {
  role: RoleProps;
  actionTypes: ActionTypesProps[];
}

interface ActionTypesProps {
  id: string;
  name: string;
  permission: boolean;
}

interface RoleProps {
  id: string;
  name: string;
}

const RolePermission = ({ roleID }: { roleID?: string }) => {
  const { data: session } = useSession();

  const initialFormData: RolePermissionProps = {
    role: {
      id: "",
      name: "",
    },
    actionTypes: [],
  };

  const [rolePermissions, setRolePermissions] =
    useState<RolePermissionProps>(initialFormData);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!roleID || !session?.user?.token) return;

      try {
        const response = await req.GET(
          `/protected/role-permissions/list?role_id=${roleID}`,
          session.user.token
        );
        console.log("Fetched permissions:", response);

        setRolePermissions({
          role: response.role,
          actionTypes: response.actionType || [],
        });
      } catch (err: any) {
        toast({
          title: "Алдаа гарлаа.",
          description: "Өгөгдлийг татаж авахад алдаа гарлаа.",
        });
      }
    };

    fetchRolePermissions();
  }, [roleID, session]);

  const handleUpdatePermissions = async () => {
    if (
      !session?.user?.token ||
      !roleID ||
      !rolePermissions?.actionTypes?.length
    ) {
      toast({
        title: "Алдаа гарлаа.",
        description:
          !session?.user?.token || !roleID
            ? "Нэвтэрсэн хэрэглэгчийн эрх байхгүй эсвэл хэрэглэгчийн ID олдсонгүй."
            : "Permission-ууд байхгүй байна.",
      });
      return;
    }

    try {
      for (const { id, permission } of rolePermissions.actionTypes) {
        if (!id || permission === undefined) {
          continue;
        }

        await req.PUT(
          `/protected/role-permissions/update`,
          session.user.token,
          JSON.stringify({
            permission,
            action_id: id,
            role_id: rolePermissions.role.id,
          })
        );
      }

      toast({
        title: "Амжилттай хадгаллаа.",
        description: "Permission-ууд амжилттай шинэчлэгдлээ.",
      });
    } catch (err) {
      console.error("Error while updating permissions:", err);
      toast({
        title: "Алдаа гарлаа.",
        description: "Шинэчлэх явцад алдаа гарлаа.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="border py-2 px-4 rounded-2xl">Эрхийн тохиргоо</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Эрхийн тохиргоо</DialogTitle>
        </DialogHeader>
        <div>
          {rolePermissions?.actionTypes &&
          rolePermissions.actionTypes.length > 0 ? (
            <>
              <div>Ролийн нэр: {rolePermissions?.role?.name}</div>
              {rolePermissions.actionTypes.map((action: ActionTypesProps) => (
                <div className="flex space-x-2 items-center" key={action.id}>
                  <Checkbox
                    checked={action.permission}
                    onCheckedChange={() => {
                      const updatedActionTypes =
                        rolePermissions.actionTypes.map((e) =>
                          e.id === action.id
                            ? { ...e, permission: !e.permission }
                            : e
                        );

                      setRolePermissions((prevState) => ({
                        ...prevState,
                        actionTypes: updatedActionTypes,
                      }));
                    }}
                  />
                  <div>{action.name}</div>
                </div>
              ))}
            </>
          ) : (
            <>PERMISSIONS NOT FOUND</>
          )}
        </div>
        <Button onClick={handleUpdatePermissions}>Шинэчлэх</Button>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermission;
