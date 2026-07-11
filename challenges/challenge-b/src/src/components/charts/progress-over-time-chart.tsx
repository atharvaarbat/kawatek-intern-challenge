import { Info } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartTableFallback } from "@/components/charts/chart-table-fallback";
import { getAccuracyDipNotes, getProgressSeries } from "@/lib/derive-metrics";
import type { Session } from "@/types/patient";

interface ProgressOverTimeChartProps {
  sessions: Session[];
}

const chartConfig = {
  overallProgress: {
    label: "Overall Progress",
    color: "var(--chart-1)",
  },
  averageAccuracy: {
    label: "Avg Accuracy",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ProgressOverTimeChart({ sessions }: ProgressOverTimeChartProps) {
  const data = getProgressSeries(sessions);
  const dipNotes = getAccuracyDipNotes(sessions);

  const tableRows = data.map((d) => [
    d.sessionLabel,
    d.date,
    `${d.overallProgress}%`,
    `${d.averageAccuracy}%`,
  ]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between flex gap-2 space-y-0">
        <CardTitle>Progress Over Time</CardTitle>
        {dipNotes.size > 0 && (
          <Tooltip>
            <TooltipTrigger
              aria-label="Why does the average accuracy line dip?"
              className="text-muted-foreground"
            >
              <Info className="size-4" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent className="max-w-64 text-pretty">
              {Array.from(dipNotes.values()).join(" ")}
            </TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      <CardContent>
        <figure aria-label={`Line chart: overall progress rose from ${data[0]?.overallProgress}% (S1) to ${data[data.length - 1]?.overallProgress}% (S${sessions.length}) over ${sessions.length} sessions`}>
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <LineChart accessibilityLayer data={data} margin={{ left: -16, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="sessionLabel" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: number) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="overallProgress"
                type="monotone"
                stroke="var(--color-overallProgress)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="averageAccuracy"
                type="monotone"
                stroke="var(--color-averageAccuracy)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </figure>
        <ChartTableFallback
          caption="Progress over time by session"
          headers={["Session", "Date", "Overall Progress", "Avg Accuracy"]}
          rows={tableRows}
        />
      </CardContent>
    </Card>
  );
}
