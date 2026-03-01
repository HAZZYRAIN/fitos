// ============================================================
// YOURTRAINER — TYPE DEFINITIONS
// All Firestore document shapes live here.
// If you add a field to Firestore, add it here first.
// ============================================================

export interface Client {
  id: string;
  // Identity
  name: string;
  email?: string;
  gender?: string;
  age?: number | string;
  // Assignment
  trainerId: string;
  trainerName: string;
  // Program
  programType: "1-on-1" | "Couple" | "Online" | string;
  status: "Active" | "On Hold" | "Inactive" | string;
  plan?: string;
  location?: string;
  // Sessions
  sessionsIncluded: number;
  sessionsLogged: number;
  classesLeft: number;
  // Metrics
  compliance: number;
  missedSessions?: number;
  lastSession?: string;
  lateLog?: boolean;
  // Progress
  weight?: number;
  startWeight?: number;
  delta?: number;
  target?: number;
  progressLastUpdated?: string;
  // Dates
  startDate?: string;
  endDate?: string;
  createdAt?: any;
  updatedAt?: any;
  // Medical
  medicalNotes?: string;
  // Legacy fields (keep for backward compatibility)
  goal?: string;
  phone?: string;
  nextSession?: string;
  planTotal?: number;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  speciality?: string;
  plan?: "Starter" | "Pro" | string;
  status?: "active" | "suspended" | string;
  // Stats
  clientCount?: number;
  sessions?: number;
  sessionsAssigned?: number;
  missedSessions?: number;
  pendingLogs?: number;
  lateSubmissions?: number;
  progressUpdatesThisMonth?: number;
  warnings?: number;
  retention?: number;
  revenue?: number;
  rating?: number;
  accountabilityScore?: number;
  // Meta
  joined?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Instruction {
  id: string;
  title: string;
  body: string;
  priority: "high" | "medium" | "low" | string;
  by: string;
  date: string;
  createdAt?: any;
}

export interface Warning {
  id: string;
  trainer: string;
  type: "Verbal Warning" | "Written Warning" | "Final Warning" | "Improvement Plan" | string;
  note: string;
  followUp?: string;
  by: string;
  date: string;
  createdAt?: any;
}

export interface SessionLog {
  id: string;
  client: string;
  trainer: string;
  trainerId: string;
  date: string;
  loggedAt: string;
  type: string;
  status: string;
  duration: number;
  late: boolean;
  notes?: string;
  modReason?: string;
  injuryFlag?: string | null;
  exercises?: ExerciseLog[];
  createdAt?: any;
}

export interface ExerciseLog {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

export interface ProgressLog {
  id: string;
  clientName: string;
  trainer: string;
  trainerId: string;
  date: string;
  weight: number;
  bf: number;
  chest: number;
  waist: number;
  hips: number;
  arms: number;
  thighs: number;
  squat: number;
  bench: number;
  deadlift: number;
  pullup: number;
  notes?: string;
  createdAt?: any;
}

export interface DietLog {
  id: string;
  clientName: string;
  trainer: string;
  trainerId: string;
  date: string;
  protein: number;
  water: number;
  steps: number;
  sleep: number;
  sleepQuality: "Great" | "Good" | "Average" | "Poor" | string;
  notes?: string;
  createdAt?: any;
}

export interface Exercise {
  name: string;
  muscles: string;
  equipment: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

export interface Template {
  id: string;
  name: string;
  category: string;
  days: string;
  duration: string;
  exercises: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
}

// Shared data passed from App → Admin / Trainer
export interface SharedData {
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];
  dbLoading: boolean;
}
