import { req } from "@/app/api";
import { Project } from "../types";

export const fetchProjects = async (
  token: string,
  isEmployeeOnly: boolean
): Promise<Project[]> => {
  const endpoint = isEmployeeOnly
    ? "/protected/projects/employee"
    : "/protected/projects";
  try {
    const response = await req.GET(endpoint, token);
    return response.map((p: any) => ({
      id: p.id,
      name: p.name,
      status: p.status === "Ongoing" ? "Active" : p.status,
      dueDate: p.end_date
        ? new Date(p.end_date).toISOString().split("T")[0]
        : "N/A",
      teamSize: p.team_members?.length || 0,
      progress: p.progress || Math.floor(Math.random() * 100),
      teamMembers: p.team_members || [],
    }));
  } catch (error: any) {
    throw new Error("Failed to fetch projects: " + error.message);
  }
};
