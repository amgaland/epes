// src/app/protected/kpi/services/kpiService.ts
import { req } from "@/app/api";
import { EmployeeKPI } from "../types";

export async function fetchEmployeeKPIs(token: string): Promise<EmployeeKPI[]> {
  const [tasksResponse, projectsResponse] = await Promise.all([
    req.GET("/protected/tasks", token),
    req.GET("/protected/projects", token),
  ]);

  // Process tasks
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

  // Process projects
  const projects = projectsResponse.map((p: any) => ({
    id: p.id,
    name: p.name,
    teamMembers: p.team_members || [],
    progress: p.progress || 0,
  }));

  // Aggregate KPIs
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
      const contribution = project.progress / (project.teamMembers.length || 1);
      employeeMap[member.user_id].projectContributions.push(contribution);
    });
  });

  return Object.values(employeeMap).map((emp) => {
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
}

export async function fetchKPIById(
  id: string,
  token: string
): Promise<EmployeeKPI> {
  const response = await req.GET(`/protected/kpi?id=${id}`, token);
  const tasks = response.tasks || [];
  const projects = response.projects || [];

  const tasksCompleted = tasks.filter(
    (t: any) =>
      t.status === "Completed" &&
      (t.deadline === null || new Date(t.deadline) >= new Date())
  ).length;
  const tasksAssigned = tasks.length;
  const taskCompletionRate =
    tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0;

  const projectContributions = projects.map(
    (p: any) => p.progress / (p.teamMembers?.length || 1)
  );
  const projectContribution =
    projectContributions.length > 0
      ? projectContributions.reduce((a: number, b: number) => a + b, 0) /
        projectContributions.length
      : 0;
  const projectsAssigned = projects.length;

  const performanceScore = 0.6 * taskCompletionRate + 0.4 * projectContribution;
  const status: "Excellent" | "Good" | "Needs Improvement" =
    performanceScore >= 80
      ? "Excellent"
      : performanceScore >= 50
        ? "Good"
        : "Needs Improvement";

  return {
    employeeId: id,
    employeeName: response.employeeName || "Unknown",
    taskCompletionRate: Math.round(taskCompletionRate),
    tasksCompleted,
    tasksAssigned,
    projectContribution: Math.round(projectContribution),
    projectsAssigned,
    performanceScore: Math.round(performanceScore),
    status,
  };
}

export async function updateKPI(
  id: string,
  data: Partial<EmployeeKPI>,
  token: string
): Promise<void> {
  await req.PUT(`/protected/kpi/${id}`, JSON.stringify(data), token);
}

export async function deleteKPI(id: string, token: string): Promise<void> {
  await req.DELETE(`/protected/kpi/${id}`, token);
}
