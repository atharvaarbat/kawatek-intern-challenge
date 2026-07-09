import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export function KpiCard({ label, value, hint, icon: Icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center  gap-2 space-y-0 flex gap-2">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
