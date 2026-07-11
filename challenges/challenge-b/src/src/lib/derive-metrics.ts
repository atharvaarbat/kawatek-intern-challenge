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

export function getFatigueSeries(sessions: Session[]) {
  const exerciseOrder = getCanonicalExerciseOrder(sessions);
  const keys = exerciseOrder.map((name) => ({
    dataKey: name.replace(/\s+/g, ""),
    label: name,
  }));

  const data = sessions.map((session) => {
    const point: Record<string, number | null | string> = {
      sessionId: session.session_id,
      sessionLabel: `S${session.session_id}`,
    };
    for (const { dataKey, label } of keys) {
      const exercise = session.exercises.find((e) => e.name === label);
      point[dataKey] = exercise ? exercise.fatigue_index : null;
    }
    return point;
  });

  return { data, keys };
}

// ─── Progress prediction ───────────────────────────────────────────────────

function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number } | null {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export interface ProgressChartPoint {
  sessionId: number;
  sessionLabel: string;
  date: string;
  overallProgress: number | null;
  averageAccuracy: number | null;
  predictedProgress: number | null;
}

/**
 * Returns the progress series extended with a linear-regression prediction
 * that extrapolates until overall progress reaches 100%.
 * Returns null for projectedAt when a prediction can't be made (too few sessions,
 * flat/declining trend, or already complete).
 */
export function getProgressSeriesWithPrediction(sessions: Session[]): {
  data: ProgressChartPoint[];
  projectedAt: string | null;
} {
  const last = sessions[sessions.length - 1];

  const actual: ProgressChartPoint[] = sessions.map((s) => ({
    sessionId: s.session_id,
    sessionLabel: `S${s.session_id}`,
    date: s.date,
    overallProgress: s.overall_progress_percent,
    averageAccuracy: Math.round(getSessionAverageAccuracy(s) * 10) / 10,
    predictedProgress: null,
  }));

  if (last.overall_progress_percent >= 100 || sessions.length < 3) {
    return { data: actual, projectedAt: null };
  }

  const reg = linearRegression(
    sessions.map((_, i) => i),
    sessions.map((s) => s.overall_progress_percent),
  );

  if (!reg || reg.slope <= 0) {
    return { data: actual, projectedAt: null };
  }

  // Bridge point: last actual session also carries predictedProgress so the
  // dashed line starts exactly where the solid line ends (no visible gap).
  actual[actual.length - 1].predictedProgress = last.overall_progress_percent;

  const future: ProgressChartPoint[] = [];
  let projectedAt: string | null = null;

  for (let i = 1; i <= 12; i++) {
    const predicted = Math.min(Math.round(reg.slope * (sessions.length - 1 + i) + reg.intercept), 100);
    const sessionLabel = `S${last.session_id + i}`;
    future.push({ sessionId: last.session_id + i, sessionLabel, date: "", overallProgress: null, averageAccuracy: null, predictedProgress: predicted });
    if (predicted >= 100) { projectedAt = sessionLabel; break; }
  }

  return { data: [...actual, ...future], projectedAt };
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
