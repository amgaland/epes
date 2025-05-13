"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { EvaluationService, Evaluation, User } from "../lib/api";
import SubmitScoreForm from "../components/SubmitScoreForm";

export default function ScoresPage() {
  const t = useTranslations("evaluation");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = "0d1de479-7eff-42e7-a8ef-1fdf6eae1923"; // Replace with dynamic ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evalData, userData] = await Promise.all([
          EvaluationService.getScores(employeeId),
          EvaluationService.getUser(),
        ]);
        setEvaluation(evalData);
        setUser(userData);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const canSubmitScores = ["admin", "manager", "hr"].includes(user?.role || "");

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">{t("scores")}</h2>
      <p>Final KPI Score: {evaluation?.final_kpi_score.toFixed(2)}</p>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th className="text-left">{t("name")}</th>
            <th className="text-left">{t("score")}</th>
            <th className="text-left">{t("weight")}</th>
          </tr>
        </thead>
        <tbody>
          {evaluation?.kpi_scores.map((score) => (
            <tr key={score.id}>
              <td>{score.metric.name}</td>
              <td>{score.score}</td>
              <td>{score.metric.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {canSubmitScores && <SubmitScoreForm />}
    </div>
  );
}
