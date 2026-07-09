import { useEffect, useState } from "react";
import type { Patient, PatientSessionsData } from "@/types/patient";

export type PatientDataState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty"; patient: Patient }
  | { status: "success"; data: PatientSessionsData };

const DATA_URL = `${import.meta.env.BASE_URL}patient_sessions.json`;

export function usePatientData(): PatientDataState {
  const [state, setState] = useState<PatientDataState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading" });
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          throw new Error(`Failed to load patient data (HTTP ${response.status})`);
        }
        const data = (await response.json()) as PatientSessionsData;
        if (cancelled) return;
        setState(
          data.sessions.length === 0
            ? { status: "empty", patient: data.patient }
            : { status: "success", data },
        );
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error loading patient data",
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
