"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  Sun,
  Moon,
  LayoutDashboardIcon,
  ListIcon,
  BarChartIcon,
  FolderIcon,
  User,
  DatabaseIcon,
  ClipboardListIcon,
  FileIcon,
  SettingsIcon,
  HelpCircleIcon,
  SearchIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"; // Shadcn Sidebar components
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/ui/nav";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideIcon } from "lucide-react";

// Define types
interface UserProfile {
  id?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  emailWork?: string;
  emailPersonal?: string;
  phoneNumberWork?: string;
  phoneNumberPersonal?: string;
  roles?: string | string[];
  token?: string;
}

interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  label?: string;
}

// Role permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "dashboard",
    "lifecycle",
    "analytics",
    "projects",
    "team",
    "data-library",
    "reports",
    "word-assistant",
    "settings",
    "help",
    "search",
  ],
  manager: ["dashboard", "projects", "team", "data-library", "reports"],
  employee: ["dashboard", "projects"],
};

const ProfileSection: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const fullName = `${profile?.lastname?.[0] || ""}.${profile?.firstname || ""}`;
  const role = Array.isArray(profile?.roles)
    ? profile?.roles.join(", ")
    : profile?.roles || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
          <User className="h-4 w-4" />
          <div className="ml-2">
            <h1 className="font-medium text-sm">{fullName}</h1>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation: React.FC<{ roles: string | string[] | undefined }> = ({
  roles,
}) => {
  const navLinks: NavLink[] = [
    {
      title: "Dashboard",
      href: "/protected/dashboard",
      icon: LayoutDashboardIcon,
      permission: "dashboard",
    },
    {
      title: "Lifecycle",
      href: "#lifecycle",
      icon: ListIcon,
      permission: "lifecycle",
    },
    {
      title: "Analytics",
      href: "#analytics",
      icon: BarChartIcon,
      permission: "analytics",
    },
    {
      title: "Projects",
      href: "/protected/project",
      icon: FolderIcon,
      permission: "projects",
    },
    {
      title: "Team",
      href: "#team",
      icon: User,
      permission: "team",
    },
    {
      title: "Data Library",
      href: "#data-library",
      icon: DatabaseIcon,
      permission: "data-library",
    },
    {
      title: "Reports",
      href: "#reports",
      icon: ClipboardListIcon,
      permission: "reports",
    },
    {
      title: "Word Assistant",
      href: "#word-assistant",
      icon: FileIcon,
      permission: "word-assistant",
    },
    {
      title: "Settings",
      href: "#settings",
      icon: SettingsIcon,
      permission: "settings",
    },
    {
      title: "Get Help",
      href: "#help",
      icon: HelpCircleIcon,
      permission: "help",
    },
    {
      title: "Search",
      href: "#search",
      icon: SearchIcon,
      permission: "search",
    },
  ];

  // Normalize roles to always be an array
  const normalizedRoles: string[] = roles
    ? Array.isArray(roles)
      ? roles
      : [roles]
    : [];

  // Get permissions based on user's roles
  const userPermissions = normalizedRoles
    .flatMap((role) => ROLE_PERMISSIONS[role.toLowerCase()] || [])
    .filter((value, index, self) => self.indexOf(value) === index);

  // Filter navigation links based on user permissions
  const filteredNavLinks = navLinks.filter((link) =>
    userPermissions.includes(link.permission)
  );

  return <Nav isCollapsed={false} links={filteredNavLinks} />;
};

const SideBar: React.FC = () => {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // Handle loading state
  if (status === "loading") {
    return (
      <Sidebar>
        <div className="h-screen w-[220px] bg-background dark:bg-background-dark animate-pulse" />
      </Sidebar>
    );
  }

  // Normalize roles from session
  const userRoles: string[] = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];

  // Use session.user directly
  const userProfile: UserProfile = session?.user || {};

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-gray-200 dark:border-gray-700"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold text-foreground">
                  Acme Inc.
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <Navigation roles={userRoles} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {session?.user && <ProfileSection profile={userProfile} />}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              className="flex items-center justify-start w-full rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="ml-2 text-sm">
                {theme === "dark" ? "Light" : "Dark"} Mode
              </span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SideBar;
