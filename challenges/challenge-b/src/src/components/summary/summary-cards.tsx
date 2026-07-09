import { Activity, ClipboardList, Target, TrendingUp } from "lucide-react";

import { KpiCard } from "@/components/summary/kpi-card";
import type { PatientSessionsData, Session } from "@/types/patient";

interface SummaryCardsProps {
  data: PatientSessionsData;
}

function sessionAverageAccuracy(session: Session) {
  const total = session.exercises.reduce((sum, e) => sum + e.accuracy_percent, 0);
  return total / session.exercises.length;
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const { sessions } = data;
  const firstSession = sessions[0];
  const latestSession = sessions[sessions.length - 1];

  const latestAccuracy = Math.round(sessionAverageAccuracy(latestSession));
  const firstAccuracy = Math.round(sessionAverageAccuracy(firstSession));

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
