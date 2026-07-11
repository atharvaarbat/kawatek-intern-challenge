import type { Exercise, Session } from "@/types/patient";

/** Hard ceiling on total sessions so a running simulation can't grow forever. */
export const SIMULATION_MAX_SESSIONS = 20;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function advanceDate(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const next = new Date(year, month - 1, day + days);
  const yyyy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function nextExercise(prev: Exercise): Exercise {
  return {
    name: prev.name,
    repetitions: prev.repetitions + Math.round(rand(0, 2)),
    // Accuracy rises with diminishing returns as it approaches the ceiling.
    accuracy_percent: Math.round(clamp(prev.accuracy_percent + rand(1, 4), 0, 98)),
    // Response time falls, floored at a realistic reaction limit.
    avg_response_time_ms: Math.round(clamp(prev.avg_response_time_ms - rand(5, 20), 180, 10_000)),
    // Fatigue keeps trending down.
    fatigue_index: round2(clamp(prev.fatigue_index - rand(0.01, 0.03), 0.1, 1)),
  };
}

/**
 * Generates the next plausible session, continuing the patient's existing
 * improvement trajectory (rising accuracy and progress, falling fatigue and
 * response time, gently increasing duration). Pure aside from `Math.random`.
 */
export function generateNextSession(sessions: Session[]): Session {
  const last = sessions[sessions.length - 1];

  return {
    session_id: last.session_id + 1,
    date: advanceDate(last.date, 2 + Math.round(rand(0, 1))),
    duration_minutes: clamp(last.duration_minutes + Math.round(rand(0, 1)) * 5, 25, 60),
    emg_quality_score: round2(clamp(last.emg_quality_score + rand(0, 0.01), 0, 0.99)),
    overall_progress_percent: Math.round(clamp(last.overall_progress_percent + rand(3, 7), 0, 100)),
    exercises: last.exercises.map(nextExercise),
  };
}
