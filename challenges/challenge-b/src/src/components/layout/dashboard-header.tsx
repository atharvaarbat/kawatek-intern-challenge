import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ExportReportButton } from "@/components/export/export-report-button";
import type { Patient } from "@/types/patient";

interface DashboardHeaderProps {
  patient: Patient;
}

export function DashboardHeader({ patient }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          ACTIVAI Rehabilitation Dashboard
        </p>
        <h1 className="text-xl font-semibold tracking-tight">{patient.name}</h1>
        <p className="text-sm text-muted-foreground">
          {patient.device} · Therapist: {patient.therapist}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{patient.id}</Badge>
        <Badge variant="outline">Age {patient.age}</Badge>
        <ExportReportButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
