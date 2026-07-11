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
      "border-green-200 bg-green-50 dark:border-green-800/60 dark:bg-green-950/30",
    iconClass: "text-green-600 dark:text-green-400",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    label: "Warning",
    wrapperClass:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800/60 dark:bg-yellow-950/30",
    iconClass: "text-yellow-600 dark:text-yellow-400",
  },
  serious: {
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
    label: "Serious",
    wrapperClass:
      "border-orange-200 bg-orange-50 dark:border-orange-800/60 dark:bg-orange-950/30",
    iconClass: "text-orange-600 dark:text-orange-400",
  },
  critical: {
    icon: <XCircle className="h-4 w-4 shrink-0" />,
    label: "Critical",
    wrapperClass: "border-red-200 bg-red-50 dark:border-red-800/60 dark:bg-red-950/30",
    iconClass: "text-red-600 dark:text-red-400",
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
