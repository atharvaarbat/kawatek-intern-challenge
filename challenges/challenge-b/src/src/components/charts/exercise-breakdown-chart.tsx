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
import { getExerciseAccuracyRanges, type ExerciseAccuracyRange } from "@/lib/derive-metrics";
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
  const data = getExerciseAccuracyRanges(sessions);
  const chartHeight = Math.max(data.length * 56, 200);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
