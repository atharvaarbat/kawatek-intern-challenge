import type { PatientSessionsData } from "@/types/patient";

export type Severity = "good" | "warning" | "serious" | "critical";

export interface Recommendation {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  warning: 2,
  good: 3,
};

function getExerciseNames(data: PatientSessionsData): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const session of data.sessions) {
    for (const ex of session.exercises) {
      if (!seen.has(ex.name)) {
        seen.add(ex.name);
        order.push(ex.name);
      }
    }
  }
  return order;
}

// Rule 1: Ready to progress — accuracy ≥80% for last 3 consecutive sessions of an exercise
function checkReadyToProgress(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;

  for (const name of getExerciseNames(data)) {
    const sessionsWithEx = sessions.filter((s) => s.exercises.some((e) => e.name === name));
    const last3 = sessionsWithEx.slice(-3);

    if (
      last3.length >= 3 &&
      last3.every((s) => s.exercises.find((e) => e.name === name)!.accuracy_percent >= 80)
    ) {
      const accuracies = last3.map(
        (s) => s.exercises.find((e) => e.name === name)!.accuracy_percent,
      );
      return {
        id: "ready-to-progress",
        severity: "good",
        title: `${name} is ready to advance`,
        detail: `Accuracy held at ${accuracies.join("%, ")}% across the last 3 sessions. Consider increasing resistance or introducing a new variation.`,
      };
    }
  }

  return null;
}

// Rule 2: Fatigue resistance improving — fatigue_index strictly decreasing across full history
function checkFatigueResistance(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;

  const improving: Array<{ name: string; first: number; latest: number; pct: number }> = [];

  for (const name of getExerciseNames(data)) {
    const series = sessions
      .filter((s) => s.exercises.some((e) => e.name === name))
      .map((s) => s.exercises.find((e) => e.name === name)!.fatigue_index);

    if (series.length < 2) continue;

    const strictlyDecreasing = series.every((val, i) => i === 0 || val < series[i - 1]);

    if (strictlyDecreasing) {
      const first = series[0];
      const latest = series[series.length - 1];
      improving.push({ name, first, latest, pct: Math.round(((first - latest) / first) * 100) });
    }
  }

  if (improving.length === 0) return null;

  improving.sort((a, b) => b.pct - a.pct);
  const leader = improving[0];
  const rest = improving.slice(1).map((e) => e.name);

  return {
    id: "fatigue-resistance-improving",
    severity: "good",
    title: `Fatigue resistance trending down across ${improving.length === 1 ? "1 exercise" : `all ${improving.length} exercises`}`,
    detail: `Led by ${leader.name} (−${leader.pct}%, ${leader.first.toFixed(2)} → ${leader.latest.toFixed(2)})${rest.length > 0 ? `, followed by ${rest.join(", ")}` : ""}. Consistent decreases signal improved neuromuscular conditioning.`,
  };
}

// Rule 3: New exercise needs focus — ≤4 sessions recorded, latest accuracy <60%, latest fatigue >0.5
function checkNewExerciseFocus(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;

  for (const name of getExerciseNames(data)) {
    const sessionsWithEx = sessions.filter((s) => s.exercises.some((e) => e.name === name));
    if (sessionsWithEx.length > 4) continue;

    const latest = sessionsWithEx[sessionsWithEx.length - 1];
    const ex = latest.exercises.find((e) => e.name === name)!;

    if (ex.accuracy_percent < 60 && ex.fatigue_index > 0.5) {
      return {
        id: "new-exercise-needs-focus",
        severity: "warning",
        title: `${name} needs more focused attention`,
        detail: `Only ${sessionsWithEx.length} sessions recorded. Latest accuracy ${ex.accuracy_percent}% with fatigue index ${ex.fatigue_index.toFixed(2)} — both indicate this exercise is still early-stage. Consider extending dedicated practice time.`,
      };
    }
  }

  return null;
}

// Rule 4: EMG signal quality — ≥0.90 positive / <0.75 corrective
function checkEmgQuality(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;
  if (sessions.length === 0) return null;

  const latest = sessions[sessions.length - 1];
  const score = latest.emg_quality_score;

  if (score >= 0.9) {
    return {
      id: "emg-quality-positive",
      severity: "good",
      title: "EMG signal quality is excellent",
      detail: `Latest session scored ${score.toFixed(2)} — above the 0.90 clinical quality threshold. Clean signal capture supports reliable biofeedback and accurate exercise tracking.`,
    };
  }

  if (score < 0.75) {
    return {
      id: "emg-quality-corrective",
      severity: "serious",
      title: "EMG signal quality needs attention",
      detail: `Latest session scored ${score.toFixed(2)}, below the 0.75 minimum threshold. Check electrode placement and skin contact quality before the next session.`,
    };
  }

  return null;
}

// Rule 5: Session-over-session overall_progress_percent check
function checkProgressTrend(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;
  if (sessions.length < 2) return null;

  const latest = sessions[sessions.length - 1];
  const previous = sessions[sessions.length - 2];
  const delta = latest.overall_progress_percent - previous.overall_progress_percent;

  if (delta > 0) {
    return {
      id: "progress-positive",
      severity: "good",
      title: "Overall progress continues to climb",
      detail: `Progress advanced from ${previous.overall_progress_percent}% to ${latest.overall_progress_percent}% (+${delta} points) in the latest session, maintaining consistent upward momentum.`,
    };
  }

  if (delta === 0) {
    return {
      id: "progress-plateau",
      severity: "warning",
      title: "Overall progress has plateaued",
      detail: `Progress held at ${latest.overall_progress_percent}% across the last two sessions. Consider reviewing exercise intensity or introducing more variety.`,
    };
  }

  return {
    id: "progress-regression",
    severity: "serious",
    title: "Overall progress dipped this session",
    detail: `Progress fell from ${previous.overall_progress_percent}% to ${latest.overall_progress_percent}% (${delta} points). Review session notes for contributing factors.`,
  };
}

// Rule 6: Reaction time improving — ≥25% drop in avg_response_time_ms over ≥5 sessions
function checkReactionTime(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;

  const improving: Array<{ name: string; first: number; latest: number; pct: number; count: number }> =
    [];

  for (const name of getExerciseNames(data)) {
    const sessionsWithEx = sessions.filter((s) => s.exercises.some((e) => e.name === name));
    if (sessionsWithEx.length < 5) continue;

    const first = sessionsWithEx[0].exercises.find((e) => e.name === name)!.avg_response_time_ms;
    const latest =
      sessionsWithEx[sessionsWithEx.length - 1].exercises.find((e) => e.name === name)!
        .avg_response_time_ms;
    const drop = (first - latest) / first;

    if (drop >= 0.25) {
      improving.push({ name, first, latest, pct: Math.round(drop * 100), count: sessionsWithEx.length });
    }
  }

  if (improving.length === 0) return null;

  improving.sort((a, b) => b.pct - a.pct);
  const leader = improving[0];
  const rest = improving.slice(1).map((e) => `${e.name} (−${e.pct}%)`);

  return {
    id: "reaction-time-improving",
    severity: "good",
    title: "Reaction times are significantly faster",
    detail: `${leader.name} response time dropped from ${leader.first} ms to ${leader.latest} ms (−${leader.pct}%) across ${leader.count} sessions${rest.length > 0 ? `. Also improving: ${rest.join(", ")}` : ""}.`,
  };
}

// Rule 7: Endurance/duration trend — latest duration ≥1.25× first, non-decreasing throughout
function checkEnduranceTrend(data: PatientSessionsData): Recommendation | null {
  const { sessions } = data;
  if (sessions.length < 2) return null;

  const durations = sessions.map((s) => s.duration_minutes);
  const first = durations[0];
  const latest = durations[durations.length - 1];
  const nonDecreasing = durations.every((d, i) => i === 0 || d >= durations[i - 1]);

  if (latest / first >= 1.25 && nonDecreasing) {
    const pct = Math.round(((latest - first) / first) * 100);
    return {
      id: "endurance-improving",
      severity: "good",
      title: "Session endurance has grown substantially",
      detail: `Duration increased from ${first} to ${latest} min (+${pct}%) and has never declined across ${sessions.length} sessions. Sustained tolerance for longer sessions reflects improved physical conditioning.`,
    };
  }

  return null;
}

const RULES = [
  checkReadyToProgress,
  checkFatigueResistance,
  checkNewExerciseFocus,
  checkEmgQuality,
  checkProgressTrend,
  checkReactionTime,
  checkEnduranceTrend,
];

export function getRecommendations(data: PatientSessionsData): Recommendation[] {
  return RULES.flatMap((rule) => {
    const result = rule(data);
    return result ? [result] : [];
  }).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
