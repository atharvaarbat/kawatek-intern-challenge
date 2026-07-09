export interface Patient {
  id: string;
  name: string;
  age: number;
  device: string;
  start_date: string;
  therapist: string;
}

export interface Exercise {
  name: string;
  repetitions: number;
  accuracy_percent: number;
  avg_response_time_ms: number;
  fatigue_index: number;
}

export interface Session {
  session_id: number;
  date: string;
  duration_minutes: number;
  emg_quality_score: number;
  overall_progress_percent: number;
  exercises: Exercise[];
}

export interface PatientSessionsData {
  patient: Patient;
  sessions: Session[];
}
