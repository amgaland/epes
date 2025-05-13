"use client";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/ui/nav";
import {
  LayoutDashboard,
  Users,
  Sun,
  Moon,
  User,
  ScanFace,
  ListCheck,
  NotebookPen,
  LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

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
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "dashboard",
    "users",
    "role",
    "action",
    "action-history",
    "projects",
    "tasks",
    "evaluation",
    "department",
    "employees",
  ],
  manager: ["dashboard", "users", "projects", "tasks"],
  employee: ["dashboard", "projects", "tasks"],
};

const ProfileSection: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const router = useRouter();
  const fullName = `${profile?.lastname?.[0] || ""}.${profile?.firstname || ""}`;
  const role = Array.isArray(profile?.roles)
    ? profile.roles.join(", ")
    : profile?.roles || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center p-2 cursor-pointer">
          <User />
          <div className="ml-2">
            <h1 className="font-semibold text-sm">{fullName}</h1>
            <p className="font-thin text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            profile?.id
              ? router.push(`/protected/user/${profile.id}`)
              : router.push("/auth/signin")
          }
          disabled={!profile?.id}
        >
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation: React.FC<{ roles: string[] }> = ({ roles }) => {
  const navLinks: NavLink[] = [
    {
      title: "Dashboard",
      href: "/protected/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard",
    },
    {
      title: "Users",
      href: "/protected/user",
      icon: Users,
      permission: "users",
    },
    {
      title: "Projects",
      href: "/protected/project",
      icon: ListCheck,
      permission: "projects",
    },
    {
      title: "Tasks",
      href: "/protected/task",
      icon: ListCheck,
      permission: "tasks",
    },
    {
      title: "Roles",
      href: "/protected/role",
      icon: ScanFace,
      permission: "role",
    },
    {
      title: "Actions",
      href: "/protected/action",
      icon: ListCheck,
      permission: "action",
    },
    {
      title: "Evaluation",
      href: "/protected/evaluation",
      icon: NotebookPen,
      permission: "evaluation",
    },
    {
      title: "Departments",
      href: "/protected/department",
      icon: NotebookPen,
      permission: "department",
    },
    {
      title: "Employees",
      href: "/protected/employee",
      icon: NotebookPen,
      permission: "employees",
    },
  ];

  const userPermissions = roles
    .flatMap((role) => ROLE_PERMISSIONS[role.toLowerCase()] || [])
    .filter((value, index, self) => self.indexOf(value) === index);

  const filteredNavLinks = navLinks.filter((link) =>
    userPermissions.includes(link.permission)
  );

  return <Nav isCollapsed={false} links={filteredNavLinks} />;
};

const SideBar: React.FC = () => {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (status === "loading") {
    return <div className="h-screen w-[220px] bg-background animate-pulse" />;
  }

  const userRoles: string[] = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];

  return (
    <div className="h-screen flex flex-col justify-between px-2 py-4 w-[220px] bg-background">
      <div className="mt-6">
        <Navigation roles={userRoles} />
      </div>
      <div className="space-y-4">
        {session?.user && (
          <ProfileSection profile={session.user as UserProfile} />
        )}
        <Button
          onClick={toggleTheme}
          variant="ghost"
          className="flex items-center justify-start w-full"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="ml-2">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
