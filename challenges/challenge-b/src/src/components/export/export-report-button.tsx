import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportReportButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Export PDF
    </Button>
  );
}
