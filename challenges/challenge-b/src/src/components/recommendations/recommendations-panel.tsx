import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecommendations } from "@/lib/recommendation-engine";
import type { PatientSessionsData } from "@/types/patient";
import { RecommendationCard } from "./recommendation-card";

interface RecommendationsPanelProps {
  data: PatientSessionsData;
}

export function RecommendationsPanel({ data }: RecommendationsPanelProps) {
  const recommendations = getRecommendations(data);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommendations
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {recommendations.length} insight{recommendations.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 max-h-100 overflow-y-auto">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations at this time.</p>
        ) : (
          recommendations.map((rec) => <RecommendationCard key={rec.id} recommendation={rec} />)
        )}
      </CardContent>
    </Card>
  );
}
