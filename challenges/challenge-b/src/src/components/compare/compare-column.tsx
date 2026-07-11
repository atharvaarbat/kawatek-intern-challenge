import type { Session } from "@/types/patient";

interface CompareColumnProps {
  session: Session;
  side: "a" | "b";
}

const SIDE_COLOR = {
  a: "var(--chart-2)",
  b: "var(--chart-4)",
} as const;

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CompareColumn({ session, side }: CompareColumnProps) {
  const color = SIDE_COLOR[side];

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
      <div
        className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
        style={{ backgroundColor: color }}
      >
        Session {session.session_id}
      </div>
      <p className="text-sm font-medium text-foreground">{formatDate(session.date)}</p>
    </div>
  );
}
