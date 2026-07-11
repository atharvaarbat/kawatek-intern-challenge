import { CheckCircle2, AlertTriangle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Recommendation, Severity } from "@/lib/recommendation-engine";

const SEVERITY_CONFIG: Record<
  Severity,
  { icon: React.ReactNode; label: string; wrapperClass: string; iconClass: string }
> = {
  good: {
    icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    label: "Good",
    wrapperClass:
      "border-green-500/25 bg-green-500/10 dark:border-green-400/20 dark:bg-green-400/10",
    iconClass: "text-green-700 dark:text-green-400",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    label: "Warning",
    wrapperClass:
      "border-amber-500/30 bg-amber-500/15 dark:border-amber-400/25 dark:bg-amber-400/10",
    iconClass: "text-amber-700 dark:text-amber-400",
  },
  serious: {
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
    label: "Serious",
    wrapperClass:
      "border-orange-500/30 bg-orange-500/15 dark:border-orange-400/25 dark:bg-orange-400/10",
    iconClass: "text-orange-700 dark:text-orange-400",
  },
  critical: {
    icon: <XCircle className="h-4 w-4 shrink-0" />,
    label: "Critical",
    wrapperClass:
      "border-red-500/25 bg-red-500/10 dark:border-red-400/20 dark:bg-red-400/10",
    iconClass: "text-red-700 dark:text-red-400",
  },
};

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const config = SEVERITY_CONFIG[recommendation.severity];

  return (
    <div className={cn("rounded-lg border p-3", config.wrapperClass)}>
      <div className={cn("mb-1 flex items-center gap-1.5", config.iconClass)}>
        {config.icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{config.label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{recommendation.title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{recommendation.detail}</p>
    </div>
  );
}
