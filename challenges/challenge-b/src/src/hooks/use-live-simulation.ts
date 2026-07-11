import { useCallback, useEffect, useState } from "react";
import type { Session } from "@/types/patient";
import { generateNextSession, SIMULATION_MAX_SESSIONS } from "@/lib/simulate-session";

/** How often a new session streams in while simulating. */
const TICK_MS = 2500;

export interface LiveSimulation {
  /** Base sessions plus any that have streamed in. */
  sessions: Session[];
  isSimulating: boolean;
  /** Number of synthetic sessions appended beyond the fetched data. */
  addedCount: number;
  /** True once the trajectory is complete (progress maxed or session cap hit). */
  atCapacity: boolean;
  toggle: () => void;
  reset: () => void;
}

export function useLiveSimulation(baseSessions: Session[]): LiveSimulation {
  const [sessions, setSessions] = useState<Session[]>(baseSessions);
  const [isSimulating, setIsSimulating] = useState(false);
  const [syncedBase, setSyncedBase] = useState<Session[]>(baseSessions);

  // Reconcile when the underlying fetched data changes (loading → success, or
  // a refetch). Adjusting state during render — rather than in an effect —
  // avoids a committed frame where charts receive an empty session list.
  if (syncedBase !== baseSessions) {
    setSyncedBase(baseSessions);
    setSessions(baseSessions);
    setIsSimulating(false);
  }

  const lastProgress = sessions[sessions.length - 1]?.overall_progress_percent ?? 0;
  const atCapacity = sessions.length >= SIMULATION_MAX_SESSIONS || lastProgress >= 100;

  useEffect(() => {
    if (!isSimulating) return;
    const id = setInterval(() => {
      setSessions((prev) => {
        const progress = prev[prev.length - 1]?.overall_progress_percent ?? 0;
        if (prev.length >= SIMULATION_MAX_SESSIONS || progress >= 100) return prev;
        return [...prev, generateNextSession(prev)];
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isSimulating]);

  // Auto-stop once the trajectory is complete.
  useEffect(() => {
    if (isSimulating && atCapacity) setIsSimulating(false);
  }, [isSimulating, atCapacity]);

  const toggle = useCallback(() => setIsSimulating((s) => !s), []);
  const reset = useCallback(() => {
    setIsSimulating(false);
    setSessions(baseSessions);
  }, [baseSessions]);

  return {
    sessions,
    isSimulating,
    addedCount: sessions.length - baseSessions.length,
    atCapacity,
    toggle,
    reset,
  };
}
