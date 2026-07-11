import { Activity, ClipboardList, Target, TrendingUp } from "lucide-react";

import { KpiCard } from "@/components/summary/kpi-card";
import { getSessionAverageAccuracy } from "@/lib/derive-metrics";
import { formatDate } from "@/lib/utils";
import type { PatientSessionsData } from "@/types/patient";

export function SummaryCards({ data }: SummaryCardsProps) {
  const { sessions } = data;
  const firstSession = sessions[0];
  const latestSession = sessions[sessions.length - 1];

  const latestAccuracy = Math.round(getSessionAverageAccuracy(latestSession));
  const firstAccuracy = Math.round(getSessionAverageAccuracy(firstSession));

  const progressDelta =
    latestSession.overall_progress_percent - firstSession.overall_progress_percent;

  const latestEmg = Math.round(latestSession.emg_quality_score * 100);
  const firstEmg = Math.round(firstSession.emg_quality_score * 100);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label="Sessions Completed"
        value={String(sessions.length)}
        hint={`${formatDate(firstSession.date)} – ${formatDate(latestSession.date)}`}
        icon={ClipboardList}
      />
      <KpiCard
        label="Avg Accuracy"
        value={`${latestAccuracy}%`}
        hint={`Up from ${firstAccuracy}% in Session 1`}
        icon={Target}
      />
      <KpiCard
        label="Progress"
        value={`${latestSession.overall_progress_percent}%`}
        hint={`${progressDelta >= 0 ? "+" : ""}${progressDelta} pts since Session 1`}
        icon={TrendingUp}
      />
      <KpiCard
        label="EMG Signal Quality"
        value={`${latestEmg}%`}
        hint={`Up from ${firstEmg}% in Session 1`}
        icon={Activity}
      />
    </div>
  );
}
