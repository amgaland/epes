"use client";

import { useTranslations } from "next-intl";
import { KPIScore } from "../lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScoreTableProps {
  scores: KPIScore[];
}

export default function ScoreTable({ scores }: ScoreTableProps) {
  const t = useTranslations("evaluation");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("score")}</TableHead>
          <TableHead>{t("weight")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scores.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No scores available
            </TableCell>
          </TableRow>
        ) : (
          scores.map((score) => (
            <TableRow key={score.id}>
              <TableCell>{score.metric.name}</TableCell>
              <TableCell>{score.score}</TableCell>
              <TableCell>{score.metric.weight}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
