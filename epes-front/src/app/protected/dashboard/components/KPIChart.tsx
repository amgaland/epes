// src/app/protected/dashboard/components/KPIChart.tsx
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIChartProps {
  data: { name: string; score: number; tasks: number; projects: number }[];
}

export function KPIChart({ data }: KPIChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#8884d8" name="Performance Score" />
            <Bar dataKey="tasks" fill="#82ca9d" name="Task Completion" />
            <Bar
              dataKey="projects"
              fill="#ffc658"
              name="Project Contribution"
            />
          </ReBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
