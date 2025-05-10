// src/app/protected/kpi/services/kpiService.ts
import { req } from "@/app/api";
import { EmployeeKPI } from "../types";

export async function fetchEmployeeKPIs(
  token: string,
  recalculate: boolean = false
): Promise<EmployeeKPI[]> {
  try {
    if (recalculate) {
      const kpis = await calculateAndSaveKPIs(token);
      return kpis;
    }

    const response = await req.GET("/protected/kpi", token);
    console.log("KPI Response:", response);

    if (!Array.isArray(response)) {
      throw new Error(
        "Expected an array of KPIs, but received: " + JSON.stringify(response)
      );
    }

    if (response.length === 0) {
      console.warn("No KPIs found in database. Consider recalculating.");
    }

    return response.map((kpi: any) => ({
      employeeId: kpi.employee_id || kpi.EmployeeID || "Unknown",
      employeeName: kpi.employee_name || kpi.EmployeeName || "Unknown",
      taskCompletionRate: Math.round(
        kpi.task_completion_rate || kpi.TaskCompletionRate || 0
      ),
      tasksCompleted: kpi.tasks_completed || kpi.TasksCompleted || 0,
      tasksAssigned: kpi.tasks_assigned || kpi.TasksAssigned || 0,
      projectContribution: Math.round(
        kpi.project_contribution || kpi.ProjectContribution || 0
      ),
      projectsAssigned: kpi.projects_assigned || kpi.ProjectsAssigned || 0,
      performanceScore: Math.round(
        kpi.performance_score || kpi.PerformanceScore || 0
      ),
      status: kpi.status || kpi.Status || "Needs Improvement",
      tasks: kpi.tasks || kpi.Tasks || [],
      projects: kpi.projects || kpi.Projects || [],
    }));
  } catch (error: any) {
    console.error("Error fetching employee KPIs:", error.message);
    throw new Error(`Failed to fetch KPIs: ${error.message}`);
  }
}

async function calculateAndSaveKPIs(token: string): Promise<EmployeeKPI[]> {
  try {
    const [tasksResponse, projectsResponse] = await Promise.all([
      req.GET("/protected/tasks", token),
      req.GET("/protected/projects", token),
    ]);

    console.log("Tasks Response:", tasksResponse);
    console.log("Projects Response:", projectsResponse);

    if (!Array.isArray(tasksResponse) || !Array.isArray(projectsResponse)) {
      throw new Error("Invalid tasks or projects response: Expected arrays");
    }

    const tasks = tasksResponse.map((t: any) => ({
      id: t.id || "Unknown",
      title: t.title || "Untitled Task",
      assignedTo: t.assigned_to?.id || null,
      status: t.status || "Unknown",
      dueDate: t.deadline
        ? new Date(t.deadline).toISOString().split("T")[0]
        : "N/A",
      firstName: t.assigned_to?.first_name || "Unassigned",
      lastName: t.assigned_to?.last_name || "",
    }));

    const projects = projectsResponse.map((p: any) => ({
      id: p.id || "Unknown",
      name: p.name || "Untitled Project",
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
            employeeName:
              `${task.firstName} ${task.lastName}`.trim() || "Unknown",
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
        const memberId = member.user_id || member.id;
        if (memberId && !employeeMap[memberId]) {
          employeeMap[memberId] = {
            employeeId: memberId,
            employeeName: member.name || "Unknown",
            tasksCompleted: 0,
            tasksAssigned: 0,
            projectContributions: [],
            projectsAssigned: 0,
            tasks: [],
            projects: [],
          };
        }
        if (memberId) {
          employeeMap[memberId].projectsAssigned += 1;
          employeeMap[memberId].projects.push({
            id: project.id,
            name: project.name,
            progress: project.progress,
          });
          const contribution =
            project.progress / (project.teamMembers.length || 1);
          employeeMap[memberId].projectContributions.push(contribution);
        }
      });
    });

    const kpis: EmployeeKPI[] = Object.values(employeeMap).map((emp) => {
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

    if (kpis.length === 0) {
      console.warn("No KPIs calculated. Check tasks and projects data.");
      throw new Error(
        "No KPIs calculated. Ensure tasks and projects are assigned to employees."
      );
    }

    const saveErrors: string[] = [];
    await Promise.all(
      kpis.map(async (kpi) => {
        try {
          // Map to backend fields, excluding unsupported fields
          const payload = {
            employee_id: kpi.employeeId,
            task_completion_rate: kpi.taskCompletionRate,
            tasks_completed: kpi.tasksCompleted,
            tasks_assigned: kpi.tasksAssigned,
            project_contribution: kpi.projectContribution,
            projects_assigned: kpi.projectsAssigned,
            performance_score: kpi.performanceScore,
            status: kpi.status,
            evaluated_at: new Date().toISOString(), // Add required field
          };
          console.log(`Sending KPI payload for ${kpi.employeeId}:`, payload);
          const response = await req.POST(
            "/protected/kpi/employee-kpi",
            JSON.stringify(payload), // Convert the payload object to a string
            token
          );
          console.log(`Saved KPI for employee ${kpi.employeeId}:`, response);
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || error.message;
          console.error(
            `Error saving KPI for employee ${kpi.employeeId}:`,
            errorMsg
          );
          saveErrors.push(`Employee ${kpi.employeeId}: ${errorMsg}`);
        }
      })
    );

    if (saveErrors.length > 0) {
      throw new Error(`Failed to save some KPIs: ${saveErrors.join("; ")}`);
    }

    return kpis;
  } catch (error: any) {
    console.error("Error calculating and saving KPIs:", error.message);
    throw new Error(`Failed to calculate and save KPIs: ${error.message}`);
  }
}

export async function fetchKPIById(
  id: string,
  token: string
): Promise<EmployeeKPI> {
  try {
    const response = await req.GET(`/protected/kpi/employee-kpi/${id}`, token);
    console.log("KPI by ID Response:", response);

    if (!response) {
      throw new Error("No KPI data returned for ID: " + id);
    }

    return {
      employeeId: response.employee_id || response.EmployeeID || id,
      employeeName:
        response.employee_name || response.EmployeeName || "Unknown",
      taskCompletionRate: Math.round(
        response.task_completion_rate || response.TaskCompletionRate || 0
      ),
      tasksCompleted: response.tasks_completed || response.TasksCompleted || 0,
      tasksAssigned: response.tasks_assigned || response.TasksAssigned || 0,
      projectContribution: Math.round(
        response.project_contribution || response.ProjectContribution || 0
      ),
      projectsAssigned:
        response.projects_assigned || response.ProjectsAssigned || 0,
      performanceScore: Math.round(
        response.performance_score || response.PerformanceScore || 0
      ),
      status: response.status || response.Status || "Needs Improvement",
      tasks: response.tasks || response.Tasks || [],
      projects: response.projects || response.Projects || [],
    };
  } catch (error: any) {
    console.error(`Error fetching KPI for ID ${id}:`, error.message);
    throw new Error(`Failed to fetch KPI for ID ${id}: ${error.message}`);
  }
}

export async function updateKPI(
  id: string,
  data: Partial<EmployeeKPI>,
  token: string
): Promise<void> {
  try {
    const payload = {
      employee_id: data.employeeId,
      task_completion_rate: data.taskCompletionRate,
      tasks_completed: data.tasksCompleted,
      tasks_assigned: data.tasksAssigned,
      project_contribution: data.projectContribution,
      projects_assigned: data.projectsAssigned,
      performance_score: data.performanceScore,
      status: data.status,
      evaluated_at: new Date().toISOString(),
    };
    await req.PUT(
      `/protected/kpi/employee-kpi/${id}`,
      JSON.stringify(payload), // Send object
      token
    );
    console.log(`Updated KPI for employee ${id}`);
  } catch (error: any) {
    console.error(`Error updating KPI for ID ${id}:`, error.message);
    throw new Error(`Failed to update KPI for ID ${id}: ${error.message}`);
  }
}

export async function deleteKPI(id: string, token: string): Promise<void> {
  try {
    await req.DELETE(`/protected/kpi/employee-kpi/${id}`, token);
    console.log(`Deleted KPI for employee ${id}`);
  } catch (error: any) {
    console.error(`Error deleting KPI for ID ${id}:`, error.message);
    throw new Error(`Failed to delete KPI for ID ${id}: ${error.message}`);
  }
}
