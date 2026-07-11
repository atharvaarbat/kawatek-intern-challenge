import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CompareColumn } from "@/components/compare/compare-column";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/patient";
import { getSessionAverageAccuracy } from "@/lib/derive-metrics";

const COLOR_A = "var(--chart-2)";
const COLOR_B = "var(--chart-4)";

// ─── Metric row: back-to-back bars from center ─────────────────────────────

interface MetricRowProps {
  label: string;
  aValue: number;
  bValue: number;
  aDisplay: string;
  bDisplay: string;
  maxValue: number;
  higherIsBetter?: boolean;
}

function MetricRow({
  label,
  aValue,
  bValue,
  aDisplay,
  bDisplay,
  maxValue,
  higherIsBetter = true,
}: MetricRowProps) {
  const aFrac = Math.min(aValue / maxValue, 1);
  const bFrac = Math.min(bValue / maxValue, 1);
  const aWins = higherIsBetter ? aValue > bValue : aValue < bValue;
  const bWins = higherIsBetter ? bValue > aValue : bValue < aValue;

  return (
    <div>
      <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </p>
      <div className="flex items-center gap-0">
        {/* A side — right-to-center */}
        <div className="flex flex-1 items-center justify-end gap-2.5">
          <span
            className={cn(
              "w-12 shrink-0 text-right text-sm font-mono font-semibold tabular-nums",
              aWins ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {aDisplay}
          </span>
          <div className="flex h-2 min-w-0 flex-1 justify-end overflow-hidden">
            <div
              className="h-full rounded-l-full transition-all duration-700"
              style={{
                width: `${aFrac * 100}%`,
                backgroundColor: aWins ? COLOR_A : "var(--muted-foreground)",
                opacity: aWins ? 1 : 0.3,
              }}
            />
          </div>
        </div>

        {/* Center spine */}
        <div className="mx-1 h-6 w-px shrink-0 bg-border" />

        {/* B side — center-to-right */}
        <div className="flex flex-1 items-center gap-2.5">
          <div className="flex h-2 min-w-0 flex-1 overflow-hidden">
            <div
              className="h-full rounded-r-full transition-all duration-700"
              style={{
                width: `${bFrac * 100}%`,
                backgroundColor: bWins ? COLOR_B : "var(--muted-foreground)",
                opacity: bWins ? 1 : 0.3,
              }}
            />
          </div>
          <span
            className={cn(
              "w-12 shrink-0 text-sm font-mono font-semibold tabular-nums",
              bWins ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {bDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Exercise row ──────────────────────────────────────────────────────────

interface ExerciseRowProps {
  name: string;
  aAccuracy?: number;
  bAccuracy?: number;
}

function ExerciseRow({ name, aAccuracy, bAccuracy }: ExerciseRowProps) {
  const aWins = aAccuracy != null && bAccuracy != null && aAccuracy > bAccuracy;
  const bWins = aAccuracy != null && bAccuracy != null && bAccuracy > aAccuracy;
  const aOnly = aAccuracy != null && bAccuracy == null;
  const bOnly = bAccuracy != null && aAccuracy == null;

  return (
    <div className="flex items-center gap-3 py-2">
      {/* A side */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {aAccuracy != null ? (
          <>
            <span
              className={cn(
                "w-10 text-right text-xs font-mono font-medium tabular-nums",
                aWins || aOnly ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {aAccuracy}%
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-l-full bg-muted">
              <div
                className="float-right h-full rounded-l-full"
                style={{
                  width: `${aAccuracy}%`,
                  backgroundColor: aWins || aOnly ? COLOR_A : "var(--muted-foreground)",
                  opacity: aWins || aOnly ? 1 : 0.35,
                }}
              />
            </div>
          </>
        ) : (
          <span className="text-xs text-muted-foreground/40">not in session</span>
        )}
      </div>

      {/* Center label */}
      <div className="w-32 shrink-0 text-center">
        <span className="text-[10px] font-medium leading-tight text-muted-foreground">{name}</span>
      </div>

      {/* B side */}
      <div className="flex flex-1 items-center gap-2">
        {bAccuracy != null ? (
          <>
            <div className="h-1.5 w-24 overflow-hidden rounded-r-full bg-muted">
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${bAccuracy}%`,
                  backgroundColor: bWins || bOnly ? COLOR_B : "var(--muted-foreground)",
                  opacity: bWins || bOnly ? 1 : 0.35,
                }}
              />
            </div>
            <span
              className={cn(
                "w-10 text-xs font-mono font-medium tabular-nums",
                bWins || bOnly ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {bAccuracy}%
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground/40">not in session</span>
        )}
      </div>
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
      {children}
    </p>
  );
}

// ─── Main dialog ───────────────────────────────────────────────────────────

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: Session[];
}

export function CompareDialog({ open, onOpenChange, sessions }: CompareDialogProps) {
  const [a, b] = sessions;
  if (!a) return null;

  const avgA = Math.round(getSessionAverageAccuracy(a));
  const avgB = b ? Math.round(getSessionAverageAccuracy(b)) : undefined;
  const maxDuration = Math.max(a.duration_minutes, b?.duration_minutes ?? 0, 60);

  const allExercises = Array.from(
    new Set([...a.exercises.map((e) => e.name), ...(b?.exercises.map((e) => e.name) ?? [])]),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] overflow-y-auto gap-0 p-0 sm:max-w-2xl"
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 border-b bg-popover px-6 py-5">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close comparison"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
            Session Comparison
          </p>

          <div className="flex items-center gap-4">
            <CompareColumn session={a} side="a" />

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background text-[10px] font-black text-muted-foreground">
              VS
            </div>

            {b ? (
              <CompareColumn session={b} side="b" />
            ) : (
              <div className="flex-1 text-center text-sm text-muted-foreground">—</div>
            )}
          </div>
        </div>

        {/* ── Key metrics ── */}
        {b && (
          <div className="border-b px-6 py-6">
            <SectionLabel>Key Metrics</SectionLabel>
            <div className="space-y-5">
              <MetricRow
                label="Overall Progress"
                aValue={a.overall_progress_percent}
                bValue={b.overall_progress_percent}
                aDisplay={`${a.overall_progress_percent}%`}
                bDisplay={`${b.overall_progress_percent}%`}
                maxValue={100}
              />
              <MetricRow
                label="Avg Accuracy"
                aValue={avgA}
                bValue={avgB!}
                aDisplay={`${avgA}%`}
                bDisplay={`${avgB}%`}
                maxValue={100}
              />
              <MetricRow
                label="Duration"
                aValue={a.duration_minutes}
                bValue={b.duration_minutes}
                aDisplay={`${a.duration_minutes}m`}
                bDisplay={`${b.duration_minutes}m`}
                maxValue={maxDuration}
              />
              <MetricRow
                label="EMG Quality"
                aValue={a.emg_quality_score * 100}
                bValue={b.emg_quality_score * 100}
                aDisplay={`${Math.round(a.emg_quality_score * 100)}%`}
                bDisplay={`${Math.round(b.emg_quality_score * 100)}%`}
                maxValue={100}
              />
            </div>
          </div>
        )}

        {/* ── Exercises ── */}
        <div className="px-6 py-6">
          <SectionLabel>Exercise Accuracy</SectionLabel>

          {/* Column header labels */}
          <div className="mb-1 flex items-center gap-3">
            <div className="flex flex-1 justify-end">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                style={{ backgroundColor: COLOR_A }}
              >
                S{a.session_id}
              </span>
            </div>
            <div className="w-32 shrink-0" />
            <div className="flex flex-1">
              {b && (
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: COLOR_B }}
                >
                  S{b.session_id}
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {allExercises.map((name) => (
              <ExerciseRow
                key={name}
                name={name}
                aAccuracy={a.exercises.find((e) => e.name === name)?.accuracy_percent}
                bAccuracy={b?.exercises.find((e) => e.name === name)?.accuracy_percent}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
