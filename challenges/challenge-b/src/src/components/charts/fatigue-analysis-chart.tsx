import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, XAxis, YAxis } from "recharts";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCanonicalExerciseOrder, getFatigueSeries } from "@/lib/derive-metrics";
import type { Session } from "@/types/patient";

interface FatigueAnalysisChartProps {
  sessions: Session[];
}

const EXERCISE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function FatigueAnalysisChart({ sessions }: FatigueAnalysisChartProps) {
  const { data, keys } = getFatigueSeries(sessions);
  const exercises = getCanonicalExerciseOrder(sessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    String(sessions[sessions.length - 1].session_id),
  );

  const chartConfig = keys.reduce<ChartConfig>((config, { dataKey, label }, index) => {
    config[dataKey] = {
      label,
      color: EXERCISE_COLORS[index % EXERCISE_COLORS.length],
    };
    return config;
  }, {});

  const selectedSession = sessions.find(
    (s) => String(s.session_id) === selectedSessionId,
  );

  const withinSessionData = selectedSession
    ? selectedSession.exercises.map((exercise) => ({
        name: exercise.name,
        fatigue_index: exercise.fatigue_index,
      }))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatigue Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="across">
          <TabsList className="mb-4">
            <TabsTrigger value="across">Across Sessions</TabsTrigger>
            <TabsTrigger value="within">Within Session</TabsTrigger>
          </TabsList>

          <TabsContent value="across">
            <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
              <LineChart accessibilityLayer data={data} margin={{ left: -16, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="sessionLabel" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  domain={[0, 1]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => value.toFixed(1)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {keys.map(({ dataKey }) => (
                  <Line
                    key={dataKey}
                    dataKey={dataKey}
                    type="monotone"
                    stroke={`var(--color-${dataKey})`}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="within">
            <div className="mb-4">
              <Select value={selectedSessionId} onValueChange={(value) => setSelectedSessionId(value)}>
                <SelectTrigger className="w-48" aria-label="Select session">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.session_id} value={String(session.session_id)}>
                      S{session.session_id} — {session.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
              <BarChart accessibilityLayer data={withinSessionData} margin={{ left: -16, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} width={140} />
                <YAxis
                  domain={[0, 1]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => value.toFixed(1)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono font-medium tabular-nums">
                          {typeof value === "number" ? value.toFixed(2) : value}
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="fatigue_index" radius={4}>
                  {withinSessionData.map((entry) => {
                    const exerciseIndex = exercises.indexOf(entry.name);
                    return (
                      <Cell
                        key={entry.name}
                        fill={EXERCISE_COLORS[exerciseIndex % EXERCISE_COLORS.length]}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
