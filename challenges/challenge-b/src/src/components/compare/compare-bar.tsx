import { GitCompareArrows, X } from "lucide-react";

interface CompareBarProps {
  count: number;
  onCompare: () => void;
  onClear: () => void;
}

export function CompareBar({ count, onCompare, onClear }: CompareBarProps) {
  if (count === 0) return null;

  const ready = count >= 2;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-background/95 px-2 py-1.5 shadow-xl shadow-black/10 backdrop-blur-md print:hidden"
      role="status"
      aria-live="polite"
      aria-label={`${count} session${count !== 1 ? "s" : ""} selected for comparison`}
    >
      {/* Count bubble */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
        {count}
      </div>

      {/* Message */}
      <span className="select-none px-2 text-xs font-medium text-muted-foreground">
        {ready ? "Ready to compare" : "Select 1 more"}
      </span>

      {/* Divider */}
      <div className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />

      {/* Compare button */}
      <button
        onClick={onCompare}
        disabled={!ready}
        className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        aria-label="Open comparison"
      >
        <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
        Compare
      </button>

      {/* Clear button */}
      <button
        onClick={onClear}
        className="ml-0.5 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Clear session selection"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
