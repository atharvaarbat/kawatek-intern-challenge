import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SimulateButton } from "@/components/layout/simulate-button";
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
import { useLiveSimulation } from "@/hooks/use-live-simulation";
import type { Session } from "@/types/patient";

const NO_SESSIONS: Session[] = [];

function App() {
  const patientData = usePatientData();
  const baseSessions =
    patientData.status === "success" ? patientData.data.sessions : NO_SESSIONS;
  const simulation = useLiveSimulation(baseSessions);
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const sessions = simulation.sessions;

  function toggleSessionSelect(id: number) {
    setSelectedSessionIds((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  const selectedSessions = selectedSessionIds
    .map((id) => sessions.find((s) => s.session_id === id))
    .filter((s): s is Session => s !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <SkipLink />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 pb-20 sm:p-6 sm:pb-20 print:p-0 print:pb-0">
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
            <DashboardHeader
              patient={patientData.data.patient}
              actions={<SimulateButton simulation={simulation} />}
            />
            <main id="main-content">
              <div className="flex flex-col gap-6">
                <SummaryCards data={{ patient: patientData.data.patient, sessions }} />
                <ProgressOverTimeChart sessions={sessions} />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-1">
                  <ExerciseBreakdownChart sessions={sessions} />
                  <RecommendationsPanel
                    data={{ patient: patientData.data.patient, sessions }}
                  />
                </div>
                <FatigueAnalysisChart sessions={sessions} />
                <SessionHistoryList
                  sessions={sessions}
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
