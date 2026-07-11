import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Session } from "@/types/patient";

interface SessionListItemProps {
  session: Session;
  isSelected: boolean;
  isDisabled: boolean;
  onToggleSelect: (id: number) => void;
}

const MAX_HINT_ID = "compare-max-hint";

export function SessionListItem({
  session,
  isSelected,
  isDisabled,
  onToggleSelect,
}: SessionListItemProps) {
  return (
    <AccordionItem value={session.session_id}>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          disabled={isDisabled}
          onCheckedChange={() => onToggleSelect(session.session_id)}
          aria-label={`Select Session ${session.session_id} for comparison`}
          aria-describedby={isDisabled ? MAX_HINT_ID : undefined}
          className="ml-1 shrink-0 print:hidden"
        />
        <AccordionTrigger headerClassName="flex-1">
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 pr-2">
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium">
                Session {session.session_id} · {formatDate(session.date)}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {session.duration_minutes} min · {session.exercises.length}{" "}
                exercises
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-normal text-muted-foreground">
              <span>Progress {session.overall_progress_percent}%</span>
              <span>EMG {Math.round(session.emg_quality_score * 100)}%</span>
            </div>
          </div>
        </AccordionTrigger>
      </div>
      <AccordionContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead className="text-right">Reps</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead className="text-right">Avg Response</TableHead>
              <TableHead className="text-right">Fatigue Index</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {session.exercises.map((exercise) => (
              <TableRow key={exercise.name}>
                <TableCell className="font-medium">{exercise.name}</TableCell>
                <TableCell className="text-right">
                  {exercise.repetitions}
                </TableCell>
                <TableCell className="text-right">
                  {exercise.accuracy_percent}%
                </TableCell>
                <TableCell className="text-right">
                  {exercise.avg_response_time_ms} ms
                </TableCell>
                <TableCell className="text-right">
                  {exercise.fatigue_index.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
}

export { MAX_HINT_ID };
