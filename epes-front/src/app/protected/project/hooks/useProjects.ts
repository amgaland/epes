import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchProjects } from "../api/projects";
import { Project, ProjectStat, SessionUser } from "../types";
import { Folder, Calendar, Users, Clock } from "lucide-react"; // Add this import

export const useProjects = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStat[]>([]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");
  const isEmployee = roles.includes("EMPLOYEE");
  const isEmployeeOnly = isEmployee && !isManager && !isAdmin;

  useEffect(() => {
    const loadProjects = async () => {
      if (!session?.user?.token) {
        alert("Authentication token missing. Please log in again.");
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        let fetchedProjects = await fetchProjects(
          session.user.token,
          isEmployeeOnly
        );

        // Filter projects for employees
        if (isEmployeeOnly) {
          fetchedProjects = fetchedProjects.filter((project) =>
            project.teamMembers?.some(
              (member) => member.user_id === (session.user as SessionUser).id
            )
          );
        }

        setProjects(fetchedProjects);

        const activeProjects = fetchedProjects.filter(
          (p) => p.status === "Active"
        ).length;
        const totalTeamSize = fetchedProjects.reduce(
          (sum, p) => sum + p.teamSize,
          0
        );
        const pendingProjects = fetchedProjects.filter(
          (p) => p.status === "Pending"
        ).length;
        const upcomingDeadlines = fetchedProjects.filter(
          (p) =>
            p.status !== "Completed" &&
            new Date(p.dueDate) <=
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ).length;

        const stats: ProjectStat[] = isEmployeeOnly
          ? [
              { title: "Active Projects", value: activeProjects, icon: Folder },
              {
                title: "Upcoming Deadlines",
                value: upcomingDeadlines,
                icon: Calendar,
              },
            ]
          : [
              { title: "Active Projects", value: activeProjects, icon: Folder },
              { title: "Team Members", value: totalTeamSize, icon: Users },
              { title: "Pending Tasks", value: pendingProjects, icon: Clock },
              {
                title: "Upcoming Deadlines",
                value: upcomingDeadlines,
                icon: Calendar,
              },
            ];

        setStats(stats);
      } catch (error: any) {
        alert(error.message);
        setProjects([]);
        setStats(
          isEmployeeOnly
            ? [
                { title: "Active Projects", value: 0, icon: Folder },
                { title: "Upcoming Deadlines", value: 0, icon: Calendar },
              ]
            : [
                { title: "Active Projects", value: 0, icon: Folder },
                { title: "Team Members", value: 0, icon: Users },
                { title: "Pending Tasks", value: 0, icon: Clock },
                { title: "Upcoming Deadlines", value: 0, icon: Calendar },
              ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadProjects();
    }
  }, [session, router, isEmployeeOnly]);

  return {
    session,
    status,
    isLoading,
    projects,
    stats,
    isAdmin,
    isManager,
    isEmployee,
    isEmployeeOnly,
    router,
  };
};
