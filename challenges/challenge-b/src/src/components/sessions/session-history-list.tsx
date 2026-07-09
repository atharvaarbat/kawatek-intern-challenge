import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionListItem } from "@/components/sessions/session-list-item";
import type { Session } from "@/types/patient";

interface SessionHistoryListProps {
  sessions: Session[];
}

export function SessionHistoryList({ sessions }: SessionHistoryListProps) {
  const latestSessionId = sessions[sessions.length - 1]?.session_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion multiple defaultValue={[latestSessionId]}>
          {sessions.map((session) => (
            <SessionListItem key={session.session_id} session={session} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
