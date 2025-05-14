import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Evaluation, EvaluationStat, Project, Task } from "../types";
import { Star, Target, MessageSquare, Calendar } from "lucide-react";

export const useEvaluations = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<EvaluationStat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const roles = session?.user?.roles
    ? Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles]
    : [];
  const isAdmin = roles.includes("ADMIN") || false;
  const isManager = roles.includes("MANAGER") || false;
  const isEmployee = roles.includes("EMPLOYEE") || false;
  const isEmployeeOnly = isEmployee && !isManager && !isAdmin;

  useEffect(() => {
    console.log("Session:", session);
    const loadEvaluations = async () => {
      if (!session?.user?.token) {
        console.error("No token found");
        alert("Authentication token missing. Please log in again.");
        router.push("/auth/signin");
        return;
      }

      try {
        setIsLoading(true);
        const token = session.user.token;
        console.log("Token:", token);
        const baseUrl = "http://localhost:8088"; // Hardcoded backend URL

        const [projectRes, taskRes, kpiRes, okrRes, feedbackRes] =
          await Promise.all([
            fetch(`${baseUrl}/protected/projects`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch((err) => {
              throw new Error(`Projects fetch failed: ${err.message}`);
            }),
            fetch(`${baseUrl}/protected/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch((err) => {
              throw new Error(`Tasks fetch failed: ${err.message}`);
            }),
            fetch(`${baseUrl}/protected/evaluations/scores`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch((err) => {
              throw new Error(`KPIs fetch failed: ${err.message}`);
            }),
            fetch(`${baseUrl}/protected/evaluations/okrs`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch((err) => {
              throw new Error(`OKRs fetch failed: ${err.message}`);
            }),
            fetch(`${baseUrl}/protected/evaluations/feedback`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch((err) => {
              throw new Error(`Feedback fetch failed: ${err.message}`);
            }),
          ]);

        const errors = [];
        if (!projectRes.ok)
          errors.push(
            `Projects: ${projectRes.status} ${projectRes.statusText}`
          );
        if (!taskRes.ok)
          errors.push(`Tasks: ${taskRes.status} ${taskRes.statusText}`);
        if (!kpiRes.ok)
          errors.push(`KPIs: ${kpiRes.status} ${kpiRes.statusText}`);
        if (!okrRes.ok)
          errors.push(`OKRs: ${projectRes.status} ${projectRes.statusText}`);
        if (!feedbackRes.ok)
          errors.push(
            `Feedback: ${projectRes.status} ${projectRes.statusText}`
          );
        if (errors.length)
          throw new Error(`Fetch errors: ${errors.join(", ")}`);

        const projectsData = await projectRes.json();
        const tasksData = await taskRes.json();
        const kpis = await kpiRes.json();
        const okrs = await okrRes.json();
        const feedbacks = await feedbackRes.json();
        console.log(
          "Projects:",
          projectsData,
          "Tasks:",
          tasksData,
          "KPIs:",
          kpis,
          "OKRs:",
          okrs,
          "Feedback:",
          feedbacks
        );

        setProjects(projectsData);
        setTasks(tasksData);

        const normalizedEvaluations: Evaluation[] = [
          ...kpis.map((kpi: any) => ({
            id: kpi.id,
            employee_id: kpi.employee_id,
            project_id: kpi.project_id || null,
            task_id: kpi.task_id || null,
            type: "KPI" as const,
            value: kpi.score,
            description: kpi.metric_id,
            date: kpi.date,
          })),
          ...okrs.map((okr: any) => ({
            id: okr.id,
            employee_id: okr.employee_id,
            project_id: okr.project_id || null,
            task_id: okr.task_id || null,
            type: "OKR" as const,
            value: okr.objective,
            description: okr.key_results?.join(", "),
            date: okr.date,
          })),
          ...feedbacks.map((feedback: any) => ({
            id: feedback.id,
            employee_id: feedback.reviewer_id,
            project_id: feedback.project_id || null,
            task_id: feedback.task_id,
            type: "Feedback" as const,
            value: feedback.comment,
            description: `Rating: ${feedback.rating}`,
            date: feedback.date,
          })),
        ];

        setEvaluations(normalizedEvaluations);

        const kpiCount = kpis.length;
        const okrCount = okrs.length;
        const feedbackCount = feedbacks.length;
        const projectEvaluations = projectsData.length
          ? projectsData.reduce(
              (sum: number, p: any) =>
                sum +
                normalizedEvaluations.filter((e) => e.project_id === p.id)
                  .length,
              0
            )
          : 0;

        const stats: EvaluationStat[] = isEmployeeOnly
          ? [
              { title: "My KPIs", value: kpiCount, icon: Star },
              {
                title: "My Feedback",
                value: feedbackCount,
                icon: MessageSquare,
              },
            ]
          : [
              { title: "Total KPIs", value: kpiCount, icon: Star },
              { title: "Total OKRs", value: okrCount, icon: Target },
              {
                title: "Total Feedback",
                value: feedbackCount,
                icon: MessageSquare,
              },
              {
                title: "Project Evaluations",
                value: projectEvaluations,
                icon: Calendar,
              },
            ];

        setStats(stats);
      } catch (error: any) {
        console.error("Error fetching evaluations:", error);
        alert(error.message);
        setEvaluations([]);
        setProjects([]);
        setTasks([]);
        setStats(
          isEmployeeOnly
            ? [
                { title: "My KPIs", value: 0, icon: Star },
                { title: "My Feedback", value: 0, icon: MessageSquare },
              ]
            : [
                { title: "Total KPIs", value: 0, icon: Star },
                { title: "Total OKRs", value: 0, icon: Target },
                { title: "Total Feedback", value: 0, icon: MessageSquare },
                { title: "Project Evaluations", value: 0, icon: Calendar },
              ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadEvaluations();
    }
  }, [session, router]);

  return {
    session,
    status,
    isLoading,
    evaluations,
    stats,
    projects,
    tasks,
    isAdmin,
    isManager,
    isEmployee,
    isEmployeeOnly,
    router,
  };
};
