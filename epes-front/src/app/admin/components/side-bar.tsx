"use client";

import { Button } from "@/components/ui/button";
import { Nav } from "@/components/ui/nav";
import {
  LayoutDashboard,
  Users,
  Sun,
  Moon,
  ShoppingCart,
  User,
  ScanFace,
  ListCheck,
  NotebookPen,
  BookText,
  House,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfileSection = ({ profile }: { profile: any }) => {
  const fullName = `${profile?.lastname[0] || ""}.${profile?.firstname || ""}`;
  const email = profile?.emailWork || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center p-2 cursor-pointer">
          <User />
          <div className="ml-2">
            <h1 className="font-semibold text-sm">{fullName}</h1>
            <p className="font-thin text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-red-600" onClick={() => signOut}>
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation = () => {
  const navLinks = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Users", href: "/admin/user", icon: Users },
    { title: "Салбар", href: "/admin/branch", icon: House },
    { title: "Role", href: "/admin/role", icon: ScanFace },
    { title: "Үйлдэл", href: "/admin/action", icon: ListCheck },
    { title: "Бичиг баримтууд", href: "/admin/document", icon: BookText },
    {
      title: "Үйлдэлийн түүх",
      href: "/admin/action-history",
      icon: NotebookPen,
    },
    // { title: "Product", href: "/admin/product", icon: ShoppingCart },
  ];

  return <Nav isCollapsed={false} links={navLinks} />;
};

export default function SideBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="h-screen flex flex-col justify-between px-2 py-4 w-[220px] bg-background dark:bg-background-dark">
      <div className="mt-6">
        <Navigation />
      </div>
      <Button
        onClick={toggleTheme}
        variant="ghost"
        className="flex items-center justify-start mt-4"
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
}
