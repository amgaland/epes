"use client";
import { NotFound, Illustration } from "@/components/ui/not-found";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/lib/checkAuth";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  useRequireAuth();
  const router = useRouter();

  return (
    <div className="relative flex flex-col w-full justify-center min-h-screen bg-background p-6 md:p-10">
      <div className="relative max-w-5xl mx-auto w-full">
        <Illustration className="absolute inset-0 w-full h-[50vh] opacity-[0.04] dark:opacity-[0.03] text-foreground" />
        <NotFound
          title="Page Not Found"
          description="Sorry, the page you are looking for does not exist in our system."
        />
        <div className="flex flex-col items-center gap-4 mt-8">
          <Button className="gap-x-2" onClick={() => router.push("/")}>
            Return to Homepage
          </Button>
          <Button
            className="gap-x-2"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In Again
          </Button>
        </div>
      </div>
    </div>
  );
}
