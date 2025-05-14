// src/app/protected/services/kpiService.ts
import axios from "axios";
import { EmployeeKPI } from "../types";

const API_BASE_URL = "http://localhost:8088/protected/kpi/kpi";

export const fetchAllKPIs = async (token: string): Promise<EmployeeKPI[]> => {
  try {
    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.map((kpi: EmployeeKPI) => ({
      ...kpi,
      employee_name: kpi.employee_name || "Unknown",
      status: kpi.status || "Needs Improvement",
      performance_score:
        typeof kpi.performance_score === "number" ? kpi.performance_score : 0,
      tasks: kpi.tasks?.map(
        (task: NonNullable<EmployeeKPI["tasks"]>[number]) => ({
          ...task,
          assigned_to: task.assigned_to || {
            id: "",
            first_name: "Unknown",
            last_name: "User",
          },
          project: task.project
            ? {
                ...task.project,
                owner: task.project.owner || {
                  id: "",
                  first_name: "Unknown",
                  last_name: "User",
                },
              }
            : undefined,
        })
      ),
      projects: kpi.projects?.map(
        (project: NonNullable<EmployeeKPI["projects"]>[number]) => ({
          ...project,
          owner: project.owner || {
            id: "",
            first_name: "Unknown",
            last_name: "User",
          },
        })
      ),
    }));
  } catch (error: any) {
    console.error(
      "Fetch all KPIs error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch KPIs");
  }
};

export const fetchKPIById = async (
  id: string,
  token: string
): Promise<EmployeeKPI> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      ...response.data,
      employee_name: response.data.employee_name || "Unknown",
      status: response.data.status || "Needs Improvement",
      performance_score:
        typeof response.data.performance_score === "number"
          ? response.data.performance_score
          : 0,
      tasks: response.data.tasks?.map(
        (task: NonNullable<EmployeeKPI["tasks"]>[number]) => ({
          ...task,
          assigned_to: task.assigned_to || {
            id: "",
            first_name: "Unknown",
            last_name: "User",
          },
          project: task.project
            ? {
                ...task.project,
                owner: task.project.owner || {
                  id: "",
                  first_name: "Unknown",
                  last_name: "User",
                },
              }
            : undefined,
        })
      ),
      projects: response.data.projects?.map(
        (project: NonNullable<EmployeeKPI["projects"]>[number]) => ({
          ...project,
          owner: project.owner || {
            id: "",
            first_name: "Unknown",
            last_name: "User",
          },
        })
      ),
    };
  } catch (error: any) {
    console.error("Fetch KPI error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch KPI");
  }
};

export const deleteKPI = async (id: string, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    console.error("Delete KPI error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to delete KPI");
  }
};
