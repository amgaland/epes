import type { NextApiRequest, NextApiResponse } from "next";
import {
  Evaluations,
  Employee,
  ApiResponse,
  OKR,
  KPI,
} from "../../types/evaluation";

let evaluations: Evaluations = {
  employees: [
    {
      id: 1,
      name: "Alice",
      role: "Developer",
      kpi: { target: "Complete 10 tasks", achieved: 8, status: "on-track" },
      okr: {
        objective: "Improve app performance",
        keyResults: ["Reduce load time by 20%", "Fix 5 bugs"],
        progress: 75,
      },
      feedback: [],
    },
    {
      id: 2,
      name: "Bob",
      role: "Manager",
      kpi: {
        target: "Increase team output by 15%",
        achieved: 12,
        status: "behind",
      },
      okr: {
        objective: "Launch new feature",
        keyResults: ["Release by Q2", "Get 100 users"],
        progress: 50,
      },
      feedback: [],
    },
  ],
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  if (req.method === "GET") {
    res.status(200).json({ data: evaluations });
  } else if (req.method === "POST") {
    const { employeeId, type, data } = req.body as {
      employeeId: number;
      type: string;
      data: any;
    };
    const employee = evaluations.employees.find((e) => e.id === employeeId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    try {
      if (type === "feedback") {
        employee.feedback.push(data as string);
      } else if (type === "kpi") {
        employee.kpi = { ...employee.kpi, ...data } as KPI;
      } else if (type === "okr") {
        employee.okr = { ...employee.okr, ...data } as OKR;
      }
      res
        .status(200)
        .json({ data: { message: "Evaluation updated", employee } });
    } catch (error) {
      res.status(500).json({ error: "Failed to update evaluation" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
