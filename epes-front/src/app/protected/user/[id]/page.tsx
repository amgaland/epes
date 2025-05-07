"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { req } from "@/app/api";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

interface UserProfile {
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
  roles: { name: string }[];
  departments: { name: string }[];
}

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || !session?.user?.token) return;
      try {
        setLoading(true);
        const response = await req.GET(
          `/admin/users?id=${id}`,
          session.user.token
        );
        setUser(response);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id, session?.user?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-xl text-red-600">Error</CardTitle>
          <p className="mt-2 text-muted-foreground">User not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card className="border shadow-xl rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-10">
          <ProfileSection
            title="Personal Information"
            items={[
              { label: "First Name", value: user.first_name },
              { label: "Last Name", value: user.last_name },
              { label: "Login ID", value: user.login_id },
            ]}
          />

          <ProfileSection
            title="Contact Information"
            items={[
              { label: "Work Email", value: user.email_work },
              { label: "Personal Email", value: user.email_personal },
              { label: "Work Phone", value: user.phone_number_work },
              { label: "Personal Phone", value: user.phone_number_personal },
            ]}
          />

          <ProfileSection
            title="Status"
            items={[
              {
                label: "Active Status",
                value: user.is_active ? "Active" : "Inactive",
                className: user.is_active ? "text-green-600" : "text-red-600",
              },
              {
                label: "Work Duration",
                value: `${user.active_start_date ? new Date(user.active_start_date).toLocaleDateString() : "Not Started"} - ${user.active_end_date ? new Date(user.active_end_date).toLocaleDateString() : "Ongoing"}`,
              },
            ]}
          />

          <ProfileSection
            title="Position"
            items={[
              {
                label: "Role",
                value:
                  user.roles?.map((r) => r.name).join(", ") || "Role not found",
              },
              {
                label: "Department",
                value:
                  user.departments?.map((d) => d.name).join(", ") ||
                  "Department not found",
              },
            ]}
          />

          <div className="flex justify-end">
            <Link href={`/protected/user/edit?id=${id}`}>
              <Button className="bg-primary hover:bg-primary-dark">Edit</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string; className?: string }[];
}) {
  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div key={idx}>
            <Label className="text-sm font-medium text-muted-foreground">
              {item.label}
            </Label>
            <p
              className={`text-sm font-semibold text-foreground mt-1 ${item.className || ""}`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
