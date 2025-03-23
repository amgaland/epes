"use client";
import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { ApiResponse } from "../types/evaluation";
import { toast } from "@/hooks/use-toast";

interface Props {
  employeeId: number;
}

export default function FeedbackForm({ employeeId }: Props) {
  const { data: session, status } = useSession();
  const token = session?.user.token;
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8088/admin/evaluations";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Feedback cannot be empty");
      return;
    }

    if (status !== "authenticated" || !token) {
      setError("You must be logged in to submit feedback");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId,
          type: "feedback",
          data: feedback,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const result: ApiResponse<{ message: string; employee: any }> =
        await res.json();
      if (result.error) throw new Error(result.error);

      toast({
        title: "Success",
        description: result.data?.message || "Feedback submitted!",
      });
      setFeedback("");
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        Submit 360 Feedback
      </h2>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter feedback..."
        rows={4}
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button
        type="submit"
        className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
