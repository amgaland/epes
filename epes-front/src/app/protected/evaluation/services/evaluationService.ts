import { EmployeeEvaluation } from "../types";

export const fetchEmployeeEvaluations = async (
  token: string,
  recalculate: boolean = false
): Promise<EmployeeEvaluation[]> => {
  const url = recalculate
    ? "/api/evaluations?recalculate=true"
    : "/api/evaluations";
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch evaluations: ${response.statusText}`);
  }

  return response.json();
};

export const deleteEvaluation = async (
  employeeId: string,
  token: string
): Promise<void> => {
  const response = await fetch(`/api/evaluations/${employeeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete evaluation: ${response.statusText}`);
  }
};
