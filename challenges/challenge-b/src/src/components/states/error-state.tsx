import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Couldn't load patient data</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
