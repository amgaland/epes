"use client";

import { KPIScore } from "../lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EvaluationTableProps {
  scores: KPIScore[];
  onSort: (field: keyof KPIScore) => void;
  isLoading: boolean;
}

export default function EvaluationTable({
  scores,
  onSort,
  isLoading,
}: EvaluationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort("metric")}>
              Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort("score")}>
              Score <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onSort("metric")}>
              Weight <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scores.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No data available
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
