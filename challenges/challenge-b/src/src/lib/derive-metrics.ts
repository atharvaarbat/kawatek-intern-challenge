import type { Session } from "@/types/patient";

export interface ProgressPoint {
  sessionId: number;
  sessionLabel: string;
  date: string;
  overallProgress: number;
  averageAccuracy: number;
}

export interface ExerciseAccuracyRange {
  name: string;
  firstAccuracy: number;
  firstSessionLabel: string;
  latestAccuracy: number;
  latestSessionLabel: string;
}

export function getSessionAverageAccuracy(session: Session): number {
  const total = session.exercises.reduce((sum, exercise) => sum + exercise.accuracy_percent, 0);
  return total / session.exercises.length;
}

export function getProgressSeries(sessions: Session[]): ProgressPoint[] {
  return sessions.map((session) => ({
    sessionId: session.session_id,
    sessionLabel: `S${session.session_id}`,
    date: session.date,
    overallProgress: session.overall_progress_percent,
    averageAccuracy: Math.round(getSessionAverageAccuracy(session) * 10) / 10,
  }));
}

/**
 * Flags sessions where the average-accuracy line dips even though every
 * already-tracked exercise improved — the dip is purely a blend effect from
 * a new, lower-scoring exercise entering the roster that session.
 */
export function getAccuracyDipNotes(sessions: Session[]): Map<number, string> {
  const notes = new Map<number, string>();
  const previousAccuracyByExercise = new Map<string, number>();

  sessions.forEach((session, index) => {
    if (index > 0) {
      const previousAverage = getSessionAverageAccuracy(sessions[index - 1]);
      const currentAverage = getSessionAverageAccuracy(session);

      const newExercises = session.exercises.filter(
        (exercise) => !previousAccuracyByExercise.has(exercise.name),
      );
      const continuingExercises = session.exercises.filter((exercise) =>
        previousAccuracyByExercise.has(exercise.name),
      );
      const allContinuingImproved =
        continuingExercises.length > 0 &&
        continuingExercises.every(
          (exercise) =>
            exercise.accuracy_percent >= (previousAccuracyByExercise.get(exercise.name) ?? 0),
        );

      if (currentAverage < previousAverage && newExercises.length > 0 && allContinuingImproved) {
        const names = newExercises.map((exercise) => exercise.name).join(", ");
        notes.set(
          session.session_id,
          `Avg accuracy dips slightly at S${session.session_id} only because ${names} enters the blend at a lower starting accuracy — every previously tracked exercise still improved this session.`,
        );
      }
    }

    session.exercises.forEach((exercise) => {
      previousAccuracyByExercise.set(exercise.name, exercise.accuracy_percent);
    });
  });

  return notes;
}

export function getCanonicalExerciseOrder(sessions: Session[]): string[] {
  const order: string[] = [];
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (!order.includes(exercise.name)) {
        order.push(exercise.name);
      }
    }
  }
  return order;
}

export function getExerciseAccuracyRanges(sessions: Session[]): ExerciseAccuracyRange[] {
  return getCanonicalExerciseOrder(sessions).map((name) => {
    const sessionsWithExercise = sessions.filter((session) =>
      session.exercises.some((exercise) => exercise.name === name),
    );
    const first = sessionsWithExercise[0];
    const latest = sessionsWithExercise[sessionsWithExercise.length - 1];

    return {
      name,
      firstAccuracy: first.exercises.find((exercise) => exercise.name === name)!.accuracy_percent,
      firstSessionLabel: `S${first.session_id}`,
      latestAccuracy: latest.exercises.find((exercise) => exercise.name === name)!.accuracy_percent,
      latestSessionLabel: `S${latest.session_id}`,
    };
  });
}
