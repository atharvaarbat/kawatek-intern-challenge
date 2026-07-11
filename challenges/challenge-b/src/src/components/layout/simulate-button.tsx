import { Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveSimulation } from "@/hooks/use-live-simulation";

interface SimulateButtonProps {
  simulation: LiveSimulation;
}

export function SimulateButton({ simulation }: SimulateButtonProps) {
  const { isSimulating, addedCount, atCapacity, toggle, reset } = simulation;
  const hasSimulated = addedCount > 0;

  return (
    <div className="flex items-center gap-2 print:hidden">
      {isSimulating && (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          LIVE
        </span>
      )}

      {atCapacity && !isSimulating ? (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset data
        </Button>
      ) : (
        <Button
          variant={isSimulating ? "secondary" : "default"}
          size="sm"
          className="gap-1.5"
          onClick={toggle}
          aria-live="polite"
        >
          {isSimulating ? (
            <>
              <Square className="h-3.5 w-3.5" aria-hidden="true" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              {hasSimulated ? "Resume" : "Simulate live data"}
            </>
          )}
        </Button>
      )}

      {hasSimulated && !isSimulating && !atCapacity && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={reset}
          aria-label="Discard simulated sessions and restore original data"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </Button>
      )}
    </div>
  );
}
