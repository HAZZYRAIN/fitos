"use client";
// ============================================================
// TRAINER CONTEXT — v5
// Changes from v4:
// - saveSession blocks future dates (UI + server-side validation)
// ============================================================
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection, addDoc, updateDoc, doc, serverTimestamp,
  onSnapshot, query, orderBy, increment,
} from "firebase/firestore";
import { WORKOUT_LIBRARY } from "../data/workoutLibrary";
import type { Client, Trainer, Instruction } from "../types";

// ── default habit shape ──────────────────────────────────────
const DEFAULT_HABITS = {
  steps: "", water: "", sleep: "", sleepQuality: "Good",
  activeMinutes: "", protein: "", calories: "", carbs: "", fats: "",
};

// ── default measurements shape ───────────────────────────────
const DEFAULT_MEASUREMENTS = {
  weight: "", chest: "", waist: "", hips: "", arms: "",
};

export interface TrainerContextValue {
  uid: string; name: string; email: string; logout: () => void; initials: string;
  clients: Client[]; trainers: Trainer[]; instructions: Instruction[];
  myClients: Client[]; myTrainer: Trainer | undefined;
  myExpiredClients: Client[]; myLowClassClients: Client[];
  myInstructions: Instruction[];
  tab: string; setTab: (t: string) => void;
  selectedClient: Client | null; setSelectedClient: (c: Client | null) => void;
  logClient: string; setLogClient: (v: string) => void;
  sessionSaved: boolean; sessionError: string; sessionLoading: boolean;
  injuryFlag: string; setInjuryFlag: (v: string) => void;
  sessionDate: string; setSessionDate: (v: string) => void;
  sessionDuration: string; setSessionDuration: (v: string) => void;
  sessionStatus: string; setSessionStatus: (v: string) => void;
  sessionType: string; setSessionType: (v: string) => void;
  sessionNotes: string; setSessionNotes: (v: string) => void;
  sessionModReason: string; setSessionModReason: (v: string) => void;
  sessionExercises: any[]; setSessionExercises: (v: any) => void;
  sessionHabits: typeof DEFAULT_HABITS; setSessionHabits: (v: any) => void;
  sessionMeasurements: typeof DEFAULT_MEASUREMENTS; setSessionMeasurements: (v: any) => void;
  saveSession: () => Promise<void>;
  libCat: string; setLibCat: (v: string) => void;
  progressClient: string; setProgressClient: (v: string) => void;
  progressTab: string; setProgressTab: (v: string) => void;
  showLogProgress: boolean; setShowLogProgress: (v: boolean) => void;
  progressSaved: boolean; progressError: string; progressLoading: boolean;
  newProgress: any; setNewProgress: (v: any) => void;
  progressHistory: Record<string, any[]>;
  saveProgress: (last?: any) => Promise<void>;
  dietClient: string; setDietClient: (v: string) => void;
  dietSaved: boolean; dietError: string; dietLoading: boolean;
  newDiet: any; setNewDiet: (v: any) => void;
  dietHistory: Record<string, any[]>;
  saveDiet: () => Promise<void>;
  todayMax: string;
}

const TrainerContext = createContext<TrainerContextValue | null>(null);

export function useTrainer() {
  const ctx = useContext(TrainerContext);
  if (!ctx) throw new Error("useTrainer must be used inside TrainerProvider");
  return ctx;
}

export function TrainerProvider({
  children, uid, name, email, logout, clients, trainers, instructions,
}: {
  children: React.ReactNode;
  uid: string; name: string; email: string; logout: () => void;
  clients: Client[]; trainers: Trainer[]; instructions: Instruction[];
}) {
  // ── today's date string for max date cap ─────────────────────
  const todayMax = new Date().toISOString().split("T")[0];

  const [tab, setTab] = useState("clients");
  const [libCat, setLibCat] = useState("Chest");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sessionExercises, setSessionExercises] = useState(
    WORKOUT_LIBRARY["Chest"].slice(0, 3).map((e) => ({ ...e, sets: "3", reps: "10", weight: "0" }))
  );
  const [logClient, setLogClient] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [injuryFlag, setInjuryFlag] = useState("");
  const [sessionDate, setSessionDate] = useState(todayMax);
  const [sessionDuration, setSessionDuration] = useState("60");
  const [sessionStatus, setSessionStatus] = useState("Completed");
  const [sessionType, setSessionType] = useState("Strength Training");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionModReason, setSessionModReason] = useState("");
  const [sessionHabits, setSessionHabits] = useState<typeof DEFAULT_HABITS>({ ...DEFAULT_HABITS });
  const [sessionMeasurements, setSessionMeasurements] = useState<typeof DEFAULT_MEASUREMENTS>({ ...DEFAULT_MEASUREMENTS });

  const [progressClientOverride, setProgressClientOverride] = useState("");
  const [dietClientOverride, setDietClientOverride] = useState("");
  const [progressTab, setProgressTab] = useState("overview");
  const [showLogProgress, setShowLogProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressLoading, setProgressLoading] = useState(false);
  const [dietSaved, setDietSaved] = useState(false);
  const [dietError, setDietError] = useState("");
  const [dietLoading, setDietLoading] = useState(false);
  const [newProgress, setNewProgress] = useState({
    weight: "", bf: "", chest: "", waist: "", hips: "",
    arms: "", thighs: "", squat: "", bench: "", deadlift: "", pullup: "", notes: "",
  });
  const [newDiet, setNewDiet] = useState({
    protein: "", water: "", steps: "", sleep: "", sleepQuality: "Good", notes: "",
  });
  const [progressHistory, setProgressHistory] = useState<Record<string, any[]>>({});
  const [dietHistory, setDietHistory] = useState<Record<string, any[]>>({});

  // ── Derived ─────────────────────────────────────────────────
  const initials = (name || "?").split(" ").map((n: string) => n[0] || "").join("").toUpperCase() || "?";
  const myClients = clients.filter((c: any) => c.trainerId === uid);
  const myTrainer = trainers.find((t: any) => t.id === uid);
  const myInstructions = instructions.filter(
    (i: any) => !i.target || i.target === "all" || i.target === uid
  );
  const progressClient = progressClientOverride || myClients[0]?.name || "";
  const setProgressClient = setProgressClientOverride;
  const dietClient = dietClientOverride || myClients[0]?.name || "";
  const setDietClient = setDietClientOverride;
  const myExpiredClients = myClients.filter(
    (c) => c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive"
  );
  const myLowClassClients = myClients.filter(
    (c) => (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0 && c.status === "Active"
  );

  // ── Firestore listeners ──────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const unsubProgress = onSnapshot(
      query(collection(db, "progressLogs"), orderBy("createdAt", "asc")),
      (snap) => {
        const grouped: Record<string, any[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.trainerId === uid) {
            if (!grouped[data.clientName]) grouped[data.clientName] = [];
            grouped[data.clientName].push({ ...data, id: d.id });
          }
        });
        setProgressHistory(grouped);
      },
      (err) => console.error("progressLogs:", err)
    );
    const unsubDiet = onSnapshot(
      query(collection(db, "dietLogs"), orderBy("createdAt", "asc")),
      (snap) => {
        const grouped: Record<string, any[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.trainerId === uid) {
            if (!grouped[data.clientName]) grouped[data.clientName] = [];
            grouped[data.clientName].push({ ...data, id: d.id });
          }
        });
        setDietHistory(grouped);
      },
      (err) => console.error("dietLogs:", err)
    );
    return () => { unsubProgress(); unsubDiet(); };
  }, [uid]);

  // ── saveSession ──────────────────────────────────────────────
  const saveSession = async () => {
    // ── Validate ─────────────────────────────────────────────
    if (!logClient)           { setSessionError("Please select a client."); return; }
    if (!sessionNotes.trim()) { setSessionError("Quality notes are required."); return; }
    if (!sessionHabits.steps) { setSessionError("Step count is required (Habits section)."); return; }
    if (!sessionHabits.water) { setSessionError("Water intake is required (Habits section)."); return; }
    if (!sessionHabits.sleep) { setSessionError("Sleep hours are required (Habits section)."); return; }

    // ── Block future dates ────────────────────────────────────
    if (sessionDate > todayMax) {
      setSessionError("Session date cannot be in the future.");
      return;
    }

    setSessionError("");
    setSessionLoading(true);

    try {
      const dateStr       = new Date(sessionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const fullDateLabel = new Date(sessionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const loggedAt      = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const now           = new Date();

      // ── Late detection ───────────────────────────────────────
      // Rule 1: Session is TODAY → late only if logged at or after 10 PM
      // Rule 2: Session is ANY PREVIOUS DAY → always late
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const sessionMidnight = new Date(sessionDate);
      sessionMidnight.setHours(0, 0, 0, 0);

      const isToday     = sessionMidnight.getTime() === todayMidnight.getTime();
      const isPastDay   = sessionMidnight.getTime() <  todayMidnight.getTime();
      const isAfter10pm = now.getHours() >= 22;

      const isLate = isPastDay || (isToday && isAfter10pm);
      // ────────────────────────────────────────────────────────

      const client = myClients.find((c) => c.name === logClient);

      // ── 1. Session log ───────────────────────────────────────
      await addDoc(collection(db, "sessionLogs"), {
        client:     logClient,
        clientId:   client?.id || "",
        clientName: logClient,
        trainer:    name,
        trainerId:  uid,
        date:       dateStr,
        loggedAt,
        type:       sessionType,
        status:     sessionStatus.toLowerCase().split(" ")[0],
        duration:   Number(sessionDuration) || 0,
        late:       isLate,
        notes:      sessionNotes,
        modReason:  sessionModReason,
        injuryFlag: injuryFlag || null,
        exercises:  sessionExercises.map((e) => ({
          name: e.name, sets: e.sets, reps: e.reps, weight: e.weight,
        })),
        steps:        Number(sessionHabits.steps) || 0,
        water:        Number(sessionHabits.water) || 0,
        sleep:        Number(sessionHabits.sleep) || 0,
        sleepQuality: sessionHabits.sleepQuality,
        ...(sessionMeasurements.weight ? { weight: Number(sessionMeasurements.weight) } : {}),
        ...(sessionMeasurements.chest  ? { chest:  Number(sessionMeasurements.chest)  } : {}),
        ...(sessionMeasurements.waist  ? { waist:  Number(sessionMeasurements.waist)  } : {}),
        ...(sessionMeasurements.hips   ? { hips:   Number(sessionMeasurements.hips)   } : {}),
        ...(sessionMeasurements.arms   ? { arms:   Number(sessionMeasurements.arms)   } : {}),
        createdAt: serverTimestamp(),
      });

      // ── 2. progressLogs ──────────────────────────────────────
      const hasMeasurements = sessionMeasurements.weight || sessionMeasurements.chest ||
        sessionMeasurements.waist || sessionMeasurements.hips || sessionMeasurements.arms;
      const hasNutrition  = sessionHabits.protein || sessionHabits.calories ||
        sessionHabits.carbs || sessionHabits.fats;
      const hasPerformance = sessionExercises.length > 0;

      const maybe = (val: any) => (val && Number(val) !== 0) ? Number(val) : null;
      const clean = (obj: Record<string, any>) =>
        Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));

      await addDoc(collection(db, "progressLogs"), clean({
        clientId:     client?.id   || "",
        clientName:   logClient,
        trainerId:    uid,
        loggedBy:     name,
        source:       "session_log",
        date:         fullDateLabel,
        steps:        Number(sessionHabits.steps) || 0,
        water:        Number(sessionHabits.water) || 0,
        sleep:        Number(sessionHabits.sleep) || 0,
        sleepQuality: sessionHabits.sleepQuality  || "Good",
        activeMinutes: Number(sessionHabits.activeMinutes) || 0,
        ...(hasMeasurements ? clean({
          weight: maybe(sessionMeasurements.weight),
          chest:  maybe(sessionMeasurements.chest),
          waist:  maybe(sessionMeasurements.waist),
          hips:   maybe(sessionMeasurements.hips),
          arms:   maybe(sessionMeasurements.arms),
        }) : {}),
        ...(hasNutrition ? clean({
          calories: maybe(sessionHabits.calories),
          protein:  maybe(sessionHabits.protein),
        }) : {}),
        ...(hasPerformance ? clean({
          exercise:     sessionExercises[0]?.name || null,
          reps:         maybe(sessionExercises[0]?.reps),
          weightLifted: maybe(sessionExercises[0]?.weight),
          endurance:    sessionType === "Cardio" ? maybe(sessionDuration) : null,
        }) : {}),
        notes:       sessionNotes,
        sessionType,
        createdAt:   serverTimestamp(),
      }));

      // ── 3. Habits → dietLogs ─────────────────────────────────
      await addDoc(collection(db, "dietLogs"), {
        clientId:     client?.id || "",
        clientName:   logClient,
        trainerId:    uid,
        trainer:      name,
        loggedBy:     uid,
        type:         "habits",
        date:         fullDateLabel,
        steps:        Number(sessionHabits.steps)          || 0,
        water:        Number(sessionHabits.water)          || 0,
        sleep:        Number(sessionHabits.sleep)          || 0,
        sleepQuality: sessionHabits.sleepQuality           || "Good",
        activeMinutes: Number(sessionHabits.activeMinutes) || 0,
        source:       "session_log",
        createdAt:    serverTimestamp(),
      });

      // ── 4. Nutrition → dietLogs (only if filled) ─────────────
      if (hasNutrition) {
        await addDoc(collection(db, "dietLogs"), {
          clientId:   client?.id || "",
          clientName: logClient,
          trainerId:  uid,
          trainer:    name,
          loggedBy:   uid,
          type:       "nutrition",
          date:       fullDateLabel,
          protein:    Number(sessionHabits.protein)  || 0,
          calories:   Number(sessionHabits.calories) || 0,
          carbs:      Number(sessionHabits.carbs)    || 0,
          fats:       Number(sessionHabits.fats)     || 0,
          water:      Number(sessionHabits.water)    || 0,
          source:     "session_log",
          createdAt:  serverTimestamp(),
        });
      }

      // ── 5. Update client doc ─────────────────────────────────
      if (client?.id) {
        const isMissed =
          sessionStatus.toLowerCase().includes("missed") ||
          sessionStatus.toLowerCase().includes("cancelled");
        const newSessionsLogged = isMissed
          ? (client.sessionsLogged || 0)
          : (client.sessionsLogged || 0) + 1;
        const newClassesLeft = Math.max(0, (client.sessionsIncluded || 0) - newSessionsLogged);
        const newCompliance  = client.sessionsIncluded > 0
          ? Math.round((newSessionsLogged / client.sessionsIncluded) * 100) : 0;
        const clientUpdates: any = {
          lastSession:    dateStr,
          lateLog:        isLate,
          sessionsLogged: newSessionsLogged,
          classesLeft:    newClassesLeft,
          compliance:     newCompliance,
          updatedAt:      serverTimestamp(),
        };
        if (isMissed) clientUpdates.missedSessions = (client.missedSessions || 0) + 1;
        await updateDoc(doc(db, "trainers", uid, "clients", client.id), clientUpdates);
      }

      // ── 6. Increment trainer stats ───────────────────────────
      const trainerUpdates: any = { sessions: increment(1), updatedAt: serverTimestamp() };
      if (isLate) trainerUpdates.lateSubmissions = increment(1);
      await updateDoc(doc(db, "trainers", uid), trainerUpdates);

      // ── Reset form ───────────────────────────────────────────
      setSessionSaved(true);
      setSessionNotes("");
      setSessionModReason("");
      setInjuryFlag("");
      setSessionHabits({ ...DEFAULT_HABITS });
      setSessionMeasurements({ ...DEFAULT_MEASUREMENTS });
      setTimeout(() => setSessionSaved(false), 3000);

    } catch (err: any) {
      console.error("saveSession error:", err);
      setSessionError("Failed to save session. Please try again.");
    } finally {
      setSessionLoading(false);
    }
  };

  // ── saveProgress (legacy standalone tab) ────────────────────
  const saveProgress = async (last?: any) => {
    if (!progressClient) return;
    setProgressError("");
    setProgressLoading(true);
    try {
      const client = myClients.find((c) => c.name === progressClient);
      await addDoc(collection(db, "progressLogs"), {
        clientId:   client?.id || "",
        clientName: progressClient,
        trainer:    name, trainerId: uid, loggedBy: name,
        type:       "weight",
        source:     "progress_tab",
        date:       new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        ...Object.fromEntries(
          Object.entries(newProgress).map(([k, v]) => [k, Number(v) || (last ? (last as any)[k] : 0) || 0])
        ),
        createdAt: serverTimestamp(),
      });
      setProgressSaved(true);
      setShowLogProgress(false);
      setNewProgress({
        weight: "", bf: "", chest: "", waist: "", hips: "",
        arms: "", thighs: "", squat: "", bench: "", deadlift: "", pullup: "", notes: "",
      });
      setTimeout(() => setProgressSaved(false), 3000);
    } catch (err: any) {
      console.error("saveProgress:", err);
      setProgressError("Failed to save. Please try again.");
    } finally { setProgressLoading(false); }
  };

  // ── saveDiet (legacy standalone tab) ────────────────────────
  const saveDiet = async () => {
    if (!dietClient) return;
    setDietError("");
    setDietLoading(true);
    try {
      const client = myClients.find((c) => c.name === dietClient);
      await addDoc(collection(db, "dietLogs"), {
        clientId:   client?.id || "",
        clientName: dietClient,
        trainer:    name, trainerId: uid, loggedBy: uid,
        type:       "habits",
        source:     "diet_tab",
        date:       new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        protein:      Number(newDiet.protein) || 0,
        water:        Number(newDiet.water)   || 0,
        steps:        Number(newDiet.steps)   || 0,
        sleep:        Number(newDiet.sleep)   || 0,
        sleepQuality: newDiet.sleepQuality,
        notes:        newDiet.notes,
        createdAt:    serverTimestamp(),
      });
      setDietSaved(true);
      setNewDiet({ protein: "", water: "", steps: "", sleep: "", sleepQuality: "Good", notes: "" });
      setTimeout(() => setDietSaved(false), 3000);
    } catch (err: any) {
      console.error("saveDiet:", err);
      setDietError("Failed to save. Please try again.");
    } finally { setDietLoading(false); }
  };

  return (
    <TrainerContext.Provider value={{
      uid, name, email, logout, initials,
      clients, trainers, instructions,
      myClients, myTrainer, myExpiredClients, myLowClassClients, myInstructions,
      tab, setTab,
      selectedClient, setSelectedClient,
      logClient, setLogClient,
      sessionSaved, sessionError, sessionLoading,
      injuryFlag, setInjuryFlag,
      sessionDate, setSessionDate,
      sessionDuration, setSessionDuration,
      sessionStatus, setSessionStatus,
      sessionType, setSessionType,
      sessionNotes, setSessionNotes,
      sessionModReason, setSessionModReason,
      sessionExercises, setSessionExercises,
      sessionHabits, setSessionHabits,
      sessionMeasurements, setSessionMeasurements,
      saveSession,
      libCat, setLibCat,
      progressClient, setProgressClient,
      progressTab, setProgressTab,
      showLogProgress, setShowLogProgress,
      progressSaved, progressError, progressLoading,
      newProgress, setNewProgress,
      progressHistory,
      saveProgress,
      dietClient, setDietClient,
      dietSaved, dietError, dietLoading,
      newDiet, setNewDiet,
      dietHistory,
      saveDiet,
      todayMax,
    }}>
      {children}
    </TrainerContext.Provider>
  );
}
