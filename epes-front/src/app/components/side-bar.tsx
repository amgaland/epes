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
}

// Role permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "dashboardadmin",
    "dashboardmanager",
    "dashboardemployee",
    "users",
    "branch",
    "role",
    "action",
    "document",
    "action-history",
    "projects",
    "tasks",
    "kpi",
  ],
  manager: ["dashboardmanager", "users", "document", "projects", "tasks"],
  employee: ["dashboardEmployee", "projects", "tasks"],
};

const ProfileSection: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const fullName = `${profile?.lastname?.[0] || ""}.${profile?.firstname || ""}`;
  const role = profile?.roles || "";

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
        <DropdownMenuItem className="text-red-600" onClick={() => signOut()}>
          Гарах
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
      title: "Admin Dashboard",
      href: "/protected/dashboardAdmin",
      icon: LayoutDashboard,
      permission: "dashboardadmin",
    },
    {
      title: "Manager Dashboard",
      href: "/protected/dashboardManager",
      icon: LayoutDashboard,
      permission: "dashboardmanager",
    },
    {
      title: "Employee Dashboard",
      href: "/protected/dashboardEmployee",
      icon: LayoutDashboard,
      permission: "dashboardemployee",
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
      title: "Салбар",
      href: "/protected/branch",
      icon: House,
      permission: "branch",
    },
    {
      title: "Role",
      href: "/protected/role",
      icon: ScanFace,
      permission: "role",
    },
    {
      title: "Үйлдэл",
      href: "/protected/action",
      icon: ListCheck,
      permission: "action",
    },
    {
      title: "Бичиг баримтууд",
      href: "/protected/document",
      icon: BookText,
      permission: "document",
    },
    {
      title: "Үйлдэлийн түүх",
      href: "/protected/action-history",
      icon: NotebookPen,
      permission: "action-history",
    },
    {
      title: "KPI",
      href: "/protected/kpi",
      icon: NotebookPen,
      permission: "kpi",
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
      <div className="h-screen w-[220px] bg-background dark:bg-background-dark animate-pulse" />
    );
  }

  // Normalize roles from session
  const userRoles: string[] = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? (session.user.roles as string[])
      : [session.user.roles as string]
    : [];

  return (
    <div className="h-screen flex flex-col justify-between px-2 py-4 w-[220px] bg-background dark:bg-background-dark">
      <div className="mt-6 ">
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
            {theme === "dark" ? "Light" : "Dark"} Mode
          </span>
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
