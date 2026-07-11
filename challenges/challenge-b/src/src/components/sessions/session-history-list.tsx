import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionListItem, MAX_HINT_ID } from "@/components/sessions/session-list-item";
import type { Session } from "@/types/patient";

interface SessionHistoryListProps {
  sessions: Session[];
  selectedSessionIds: number[];
  onToggleSelect: (id: number) => void;
}

export function SessionHistoryList({
  sessions,
  selectedSessionIds,
  onToggleSelect,
}: SessionHistoryListProps) {
  const latestSessionId = sessions[sessions.length - 1]?.session_id;
  const atMax = selectedSessionIds.length >= 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
      </CardHeader>
      <CardContent>
        <p id={MAX_HINT_ID} className="sr-only">
          Maximum 2 sessions can be selected for comparison.
        </p>
        <Accordion multiple defaultValue={[latestSessionId]}>
          {sessions.map((session) => {
            const isSelected = selectedSessionIds.includes(session.session_id);
            return (
              <SessionListItem
                key={session.session_id}
                session={session}
                isSelected={isSelected}
                isDisabled={atMax && !isSelected}
                onToggleSelect={onToggleSelect}
              />
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
