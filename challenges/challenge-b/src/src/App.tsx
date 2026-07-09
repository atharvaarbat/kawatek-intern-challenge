import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SessionHistoryList } from "@/components/sessions/session-history-list";
import { SummaryCards } from "@/components/summary/summary-cards";
import { ProgressOverTimeChart } from "@/components/charts/progress-over-time-chart";
import { ExerciseBreakdownChart } from "@/components/charts/exercise-breakdown-chart";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { usePatientData } from "@/hooks/use-patient-data";

function App() {
  const patientData = usePatientData();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
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
          <SummaryCards data={patientData.data} />
          <ProgressOverTimeChart sessions={patientData.data.sessions} />
          <ExerciseBreakdownChart sessions={patientData.data.sessions} />
          <SessionHistoryList sessions={patientData.data.sessions} />
        </>
      )}
    </div>
  );
}

export default App;
