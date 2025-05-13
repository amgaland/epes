import { req } from "./req";

export interface KPIScore {
  id: string;
  employee_id: string;
  metric_id: number;
  metric: { name: string; weight: number };
  score: number;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  assigned_to_id: string;
  status: string;
  completion_score: number;
}

export interface TaskFeedback {
  id: string;
  task_id: string;
  evaluator_id: string;
  comment: string;
  rating: number;
}

export interface OKR {
  id: number;
  employee_id: string;
  objective: string;
  progress: number;
}

export interface Evaluation {
  employee_id: string;
  final_kpi_score: number;
  kpi_scores: KPIScore[];
  task_feedback: TaskFeedback[];
  tasks: Task[];
  okrs: OKR[];
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "manager" | "employee";
  login_id?: string;
}

export const EvaluationService = {
  getScores: async (employeeId: string, token: string): Promise<Evaluation> => {
    return req.GET(
      `/protected/evaluations/scores?employee_id=${employeeId}`,
      token
    );
  },

  createKPIScore: async (
    data: { employee_id: string; metric_id: number; score: number },
    token: string
  ): Promise<KPIScore> => {
    return req.POST("/protected/evaluations/scores", data, token);
  },

  createEvaluation: async (
    data: { employee_id: string; metric_id: number; score: number },
    token: string
  ): Promise<KPIScore> => {
    // Using /protected/evaluations/scores to start an evaluation
    return req.POST("/protected/evaluations/scores", data, token);
  },

  createFeedback: async (
    data: {
      task_id: string;
      evaluator_id: string;
      comment: string;
      rating: number;
    },
    token: string
  ): Promise<TaskFeedback> => {
    return req.POST("/protected/evaluations/feedback", data, token);
  },

  getTasks: async (employeeId: string, token: string): Promise<Task[]> => {
    return req.GET(
      `/protected/evaluations/tasks?employee_id=${employeeId}`,
      token
    );
  },

  createReport: async (token: string): Promise<string> => {
    return req.POST("/protected/evaluations/reports", {}, token);
  },

  createOKR: async (
    data: { employee_id: string; objective: string },
    token: string
  ): Promise<OKR> => {
    return req.POST("/protected/evaluations/okrs", data, token);
  },

  updateTaskCompletion: async (
    data: { task_id: string; completion_score: number },
    token: string
  ): Promise<{ message: string }> => {
    return req.POST("/protected/evaluations/tasks/completion", data, token);
  },

  getUsers: async (token: string): Promise<User[]> => {
    return req.GET("/admin/users/", token);
  },

  getUser: async (token: string): Promise<User> => {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.user_id;
    const users = await EvaluationService.getUsers(token);
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    return { ...user, role: user.role || "employee" };
  },
};
