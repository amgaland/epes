// src/app/protected/dashboard/services/dashboardService.ts
import { req } from "@/app/api";
import { EmployeeKPI } from "../../kpi/types";
import { DashboardData, TeamFilter } from "../types";
import { BarChart, CheckCircle, Clock, Users } from "lucide-react";

export async function fetchDashboardData(
  role: string,
  token: string,
  filter: TeamFilter = {}
): Promise<DashboardData> {
  let kpis: EmployeeKPI[] = [];

  if (role === "ADMIN") {
    const [tasksResponse, projectsResponse] = await Promise.all([
      req.GET("/protected/tasks", token),
      req.GET("/protected/projects", token),
    ]);

    const tasks = tasksResponse.map((t: any) => ({
      id: t.id,
      title: t.title,
      assignedTo: t.assigned_to?.id || null,
      status: t.status,
      dueDate: t.deadline
        ? new Date(t.deadline).toISOString().split("T")[0]
        : "N/A",
      firstName: t.assigned_to?.first_name || "Unassigned",
      lastName: t.assigned_to?.last_name || "",
    }));

    const projects = projectsResponse.map((p: any) => ({
      id: p.id,
      name: p.name,
      teamMembers: p.team_members || [],
      progress: p.progress || 0,
    }));

    const employeeMap: {
      [key: string]: {
        employeeId: string;
        employeeName: string;
        tasksCompleted: number;
        tasksAssigned: number;
        projectContributions: number[];
        projectsAssigned: number;
        tasks: { id: string; title: string; status: string; dueDate: string }[];
        projects: { id: string; name: string; progress: number }[];
      };
    } = {};

    tasks.forEach((task: any) => {
      if (task.assignedTo) {
        if (!employeeMap[task.assignedTo]) {
          employeeMap[task.assignedTo] = {
            employeeId: task.assignedTo,
            employeeName: `${task.firstName} ${task.lastName}`.trim(),
            tasksCompleted: 0,
            tasksAssigned: 0,
            projectContributions: [],
            projectsAssigned: 0,
            tasks: [],
            projects: [],
          };
        }
        employeeMap[task.assignedTo].tasksAssigned += 1;
        employeeMap[task.assignedTo].tasks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          dueDate: task.dueDate,
        });
        if (
          task.status === "Completed" &&
          (task.dueDate === "N/A" || new Date(task.dueDate) >= new Date())
        ) {
          employeeMap[task.assignedTo].tasksCompleted += 1;
        }
      }
    });

    projects.forEach((project: any) => {
      project.teamMembers.forEach((member: any) => {
        if (!employeeMap[member.user_id]) {
          employeeMap[member.user_id] = {
            employeeId: member.user_id,
            employeeName: member.name || "Unknown",
            tasksCompleted: 0,
            tasksAssigned: 0,
            projectContributions: [],
            projectsAssigned: 0,
            tasks: [],
            projects: [],
          };
        }
        employeeMap[member.user_id].projectsAssigned += 1;
        employeeMap[member.user_id].projects.push({
          id: project.id,
          name: project.name,
          progress: project.progress,
        });
        const contribution =
          project.progress / (project.teamMembers.length || 1);
        employeeMap[member.user_id].projectContributions.push(contribution);
      });
    });

    kpis = Object.values(employeeMap).map((emp) => {
      const taskCompletionRate =
        emp.tasksAssigned > 0
          ? (emp.tasksCompleted / emp.tasksAssigned) * 100
          : 0;
      const projectContribution =
        emp.projectContributions.length > 0
          ? emp.projectContributions.reduce((a, b) => a + b, 0) /
            emp.projectContributions.length
          : 0;
      const performanceScore =
        0.6 * taskCompletionRate + 0.4 * projectContribution;
      let status: "Excellent" | "Good" | "Needs Improvement" =
        "Needs Improvement";
      if (performanceScore >= 80) status = "Excellent";
      else if (performanceScore >= 50) status = "Good";

      return {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        taskCompletionRate: Math.round(taskCompletionRate),
        tasksCompleted: emp.tasksCompleted,
        tasksAssigned: emp.tasksAssigned,
        projectContribution: Math.round(projectContribution),
        projectsAssigned: emp.projectsAssigned,
        performanceScore: Math.round(performanceScore),
        status,
        tasks: emp.tasks,
        projects: emp.projects,
      };
    });
  } else if (role === "MANAGER") {
    const response = await req.GET(
      `/protected/kpi/team?teamId=${filter.teamId}`,
      token
    );
    kpis = response.map((kpi: any) => ({
      employeeId: kpi.employeeId,
      employeeName: kpi.employeeName,
      taskCompletionRate: kpi.taskCompletionRate,
      tasksCompleted: kpi.tasksCompleted,
      tasksAssigned: kpi.tasksAssigned,
      projectContribution: kpi.projectContribution,
      projectsAssigned: kpi.projectsAssigned,
      performanceScore: kpi.performanceScore,
      status: kpi.status,
      tasks: kpi.tasks,
      projects: kpi.projects,
    }));
  } else if (role === "EMPLOYEE") {
    const response = await req.GET(
      `/protected/kpi/self?userId=${filter.userId}`,
      token
    );
    kpis = [
      {
        employeeId: response.employeeId,
        employeeName: response.employeeName,
        taskCompletionRate: response.taskCompletionRate,
        tasksCompleted: response.tasksCompleted,
        tasksAssigned: response.tasksAssigned,
        projectContribution: response.projectContribution,
        projectsAssigned: response.projectsAssigned,
        performanceScore: response.performanceScore,
        status: response.status,
        tasks: response.tasks,
        projects: response.projects,
      },
    ];
  }

  const excellentPerformers = kpis.filter(
    (k) => k.status === "Excellent"
  ).length;
  const goodPerformers = kpis.filter((k) => k.status === "Good").length;
  const needsImprovement = kpis.filter(
    (k) => k.status === "Needs Improvement"
  ).length;
  const avgPerformanceScore =
    kpis.length > 0
      ? Math.round(
          kpis.reduce((sum, k) => sum + k.performanceScore, 0) / kpis.length
        )
      : 0;

  return {
    kpis,
    stats: [
      {
        title: "Excellent Performers",
        value: excellentPerformers,
        icon: CheckCircle,
      },
      { title: "Good Performers", value: goodPerformers, icon: Users },
      { title: "Needs Improvement", value: needsImprovement, icon: Clock },
      {
        title: "Avg Performance Score",
        value: avgPerformanceScore,
        icon: BarChart,
      },
    ],
  };
}
