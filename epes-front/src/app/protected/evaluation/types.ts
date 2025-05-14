import { LucideIcon } from "lucide-react";

export interface FeedbackSource {
  peerScore: number; // Average score from peers (0-100)
  managerScore: number; // Score from direct manager (0-100)
  subordinateScore: number; // Average score from subordinates (0-100)
  selfScore: number; // Self-assessment score (0-100)
}

export interface OKR {
  id: string;
  objective: string; // e.g., "Improve team productivity"
  keyResults: {
    id: string;
    description: string; // e.g., "Reduce project delivery time by 20%"
    target: number; // Target value (e.g., 20 for 20%)
    current: number; // Current progress
    completionRate: number; // Percentage completed (current/target * 100)
  }[];
  completionRate: number; // Overall OKR completion percentage
}

export interface EmployeeEvaluation {
  employeeId: string; // Unique identifier
  name: string; // Employee's full name
  department: string; // e.g., "Engineering", "Sales"
  position: string; // e.g., "Software Engineer", "Sales Manager"
  feedback: FeedbackSource; // 360-degree feedback scores
  averageFeedbackScore: number; // Weighted average of feedback scores (0-100)
  okrs: OKR[]; // List of OKRs assigned to the employee
  okrCompletionRate: number; // Average completion rate across all OKRs (0-100)
  overallStatus: "High Performing" | "Satisfactory" | "Needs Improvement"; // Derived from feedback and OKR scores
  lastUpdated: string; // ISO date string, e.g., "2025-05-13T17:56:00Z"
}

export interface ReportConfig {
  employeeId: string;
  period: "allTime" | "lastQuarter" | "lastYear";
  includeFeedback: boolean;
  includeOKRs: boolean;
  includeComments: boolean;
}

export interface Evaluation {
  [x: string]: any;
  id: string;
  employee_id: string;
  type: "KPI" | "OKR" | "Feedback";
  value: string | number; // Score for KPI, objective for OKR, comment for Feedback
  description?: string;
  date: string;
}
export interface EvaluationStat {
  title: string;
  value: number;
  icon: LucideIcon;
}

export interface Project {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Completed";
  dueDate: string;
  teamSize: number;
  progress?: number;
  teamMembers?: { user_id: string; name: string; role_in_project: string }[];
}
export interface Task {
  id: string;
  title: string;
  assigned_to_id: string;
  status: string;
  completion_score: number;
}
