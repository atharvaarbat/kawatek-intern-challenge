import { Inbox } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmptyStateProps {
  patientName: string;
}

export function EmptyState({ patientName }: EmptyStateProps) {
  return (
    <Alert>
      <Inbox />
      <AlertTitle>No sessions recorded yet</AlertTitle>
      <AlertDescription>
        Once {patientName} completes a session, it will appear here.
      </AlertDescription>
    </Alert>
  );
}
