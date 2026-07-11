import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SkipLink } from "@/components/layout/skip-link";
import { SessionHistoryList } from "@/components/sessions/session-history-list";
import { SummaryCards } from "@/components/summary/summary-cards";
import { ProgressOverTimeChart } from "@/components/charts/progress-over-time-chart";
import { ExerciseBreakdownChart } from "@/components/charts/exercise-breakdown-chart";
import { FatigueAnalysisChart } from "@/components/charts/fatigue-analysis-chart";
import { RecommendationsPanel } from "@/components/recommendations/recommendations-panel";
import { CompareBar } from "@/components/compare/compare-bar";
import { CompareDialog } from "@/components/compare/compare-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { usePatientData } from "@/hooks/use-patient-data";

function App() {
  const patientData = usePatientData();
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  function toggleSessionSelect(id: number) {
    setSelectedSessionIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  const selectedSessions =
    patientData.status === "success"
      ? selectedSessionIds
          .map((id) => patientData.data.sessions.find((s) => s.session_id === id)!)
          .filter(Boolean)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];

  return (
    <>
      <SkipLink />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 pb-20 sm:p-6 sm:pb-20">
        {patientData.status === "loading" && <LoadingSkeleton />}

        {patientData.status === "error" && (
          <ErrorState message={patientData.message} />
        )}

        {patientData.status === "empty" && (
          <>
            <DashboardHeader patient={patientData.patient} />
            <EmptyState patientName={patientData.patient.name} />
          </>
        )}

        {patientData.status === "success" && (
          <>
            <DashboardHeader patient={patientData.data.patient} />
            <main id="main-content">
              <div className="flex flex-col gap-6">
                <SummaryCards data={patientData.data} />
                <ProgressOverTimeChart sessions={patientData.data.sessions} />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ExerciseBreakdownChart sessions={patientData.data.sessions} />
                  <RecommendationsPanel data={patientData.data} />
                </div>
                <FatigueAnalysisChart sessions={patientData.data.sessions} />
                <SessionHistoryList
                  sessions={patientData.data.sessions}
                  selectedSessionIds={selectedSessionIds}
                  onToggleSelect={toggleSessionSelect}
                />
              </div>
            </main>
          </>
        )}
      </div>

      {patientData.status === "success" && (
        <>
          <CompareBar
            count={selectedSessionIds.length}
            onCompare={() => setCompareOpen(true)}
            onClear={() => setSelectedSessionIds([])}
          />
          <CompareDialog
            open={compareOpen}
            onOpenChange={setCompareOpen}
            sessions={selectedSessions}
          />
        </>
      )}
    </>
  );
}

export default App;
