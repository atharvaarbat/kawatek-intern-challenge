import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartTableFallback } from "@/components/charts/chart-table-fallback";
import {
  getCanonicalExerciseOrder,
  getExerciseAccuracyRanges,
  type ExerciseAccuracyRange,
} from "@/lib/derive-metrics";
import type { Session } from "@/types/patient";

interface ExerciseBreakdownChartProps {
  sessions: Session[];
}

const chartConfig = {
  firstAccuracy: {
    label: "First Recorded",
    color: "var(--chart-1)",
  },
  latestAccuracy: {
    label: "Latest",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ExerciseBreakdownChart({ sessions }: ExerciseBreakdownChartProps) {
  const [filterExercise, setFilterExercise] = useState("all");

  const exercises = getCanonicalExerciseOrder(sessions);
  const allData = getExerciseAccuracyRanges(sessions);
  const data = filterExercise === "all" ? allData : allData.filter((d) => d.name === filterExercise);

  const chartHeight = Math.max(data.length * 56, 200);

  const tableRows = data.map((d) => {
    const delta = d.latestAccuracy - d.firstAccuracy;
    return [
      d.name,
      `${d.firstAccuracy}% (${d.firstSessionLabel})`,
      `${d.latestAccuracy}% (${d.latestSessionLabel})`,
      `${delta >= 0 ? "+" : ""}${delta}%`,
    ];
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between flex gap-2 space-y-0">
        <CardTitle>Exercise Breakdown</CardTitle>
        <Select value={filterExercise} onValueChange={setFilterExercise}>
          <SelectTrigger className="w-48" aria-label="Filter by exercise">
            <SelectValue placeholder="All exercises" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All exercises</SelectItem>
            {exercises.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <figure
          aria-label={`Bar chart comparing first-recorded vs latest accuracy for ${data.length} exercise${data.length === 1 ? "" : "s"}`}
        >
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: chartHeight }}
          >
            <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => `${value}%`}
              />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={140} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const row = item.payload as ExerciseAccuracyRange;
                      const isFirst = name === "firstAccuracy";
                      const sessionLabel = isFirst ? row.firstSessionLabel : row.latestSessionLabel;
                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {isFirst ? "First recorded" : "Latest"} ({sessionLabel})
                          </span>
                          <span className="font-mono font-medium tabular-nums">{value}%</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="firstAccuracy" fill="var(--color-firstAccuracy)" radius={4} />
              <Bar dataKey="latestAccuracy" fill="var(--color-latestAccuracy)" radius={4} />
            </BarChart>
          </ChartContainer>
        </figure>
        <ChartTableFallback
          caption="Exercise accuracy — first recorded vs latest"
          headers={["Exercise", "First Recorded", "Latest", "Change"]}
          rows={tableRows}
        />
      </CardContent>
    </Card>
  );
}
