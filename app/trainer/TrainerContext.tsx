"use client";
// ============================================================
// TRAINER CONTEXT — FIXED
// Fix 1: Removed double-write on sessions (subcollection removed)
// Fix 2: Trainer sessions count now increments on saveSession
// Fix 3: Instructions filtered by target === "all" OR target === uid
// Fix 4: progressHistory / dietHistory filtered by trainerId only (name fallback removed)
// ============================================================
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  increment, // FIX 2: needed for atomic increment
} from "firebase/firestore";
import { WORKOUT_LIBRARY } from "../data/workoutLibrary";
import type { Client, Trainer, Instruction } from "../types";

export interface TrainerContextValue {
  // Identity
  uid: string;
  name: string;
  email: string;
  logout: () => void;
  initials: string;
  // Live data
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  // Derived
  myClients: Client[];
  myTrainer: Trainer | undefined;
  myExpiredClients: Client[];
  myLowClassClients: Client[];
  myInstructions: Instruction[]; // FIX 3: now properly filtered
  // Tab
  tab: string;
  setTab: (t: string) => void;
  // Selected client
  selectedClient: Client | null;
  setSelectedClient: (c: Client | null) => void;
  // Session state
  logClient: string;
  setLogClient: (v: string) => void;
  sessionSaved: boolean;
  sessionError: string;
  sessionLoading: boolean; // NEW: loading state for save button
  injuryFlag: string;
  setInjuryFlag: (v: string) => void;
  sessionDate: string;
  setSessionDate: (v: string) => void;
  sessionDuration: string;
  setSessionDuration: (v: string) => void;
  sessionStatus: string;
  setSessionStatus: (v: string) => void;
  sessionType: string;
  setSessionType: (v: string) => void;
  sessionNotes: string;
  setSessionNotes: (v: string) => void;
  sessionModReason: string;
  setSessionModReason: (v: string) => void;
  sessionExercises: any[];
  setSessionExercises: (v: any) => void;
  saveSession: () => Promise<void>;
  // Library
  libCat: string;
  setLibCat: (v: string) => void;
  // Progress state
  progressClient: string;
  setProgressClient: (v: string) => void;
  progressTab: string;
  setProgressTab: (v: string) => void;
  showLogProgress: boolean;
  setShowLogProgress: (v: boolean) => void;
  progressSaved: boolean;
  progressLoading: boolean; // NEW: loading state
  newProgress: any;
  setNewProgress: (v: any) => void;
  progressHistory: Record<string, any[]>;
  saveProgress: (last?: any) => Promise<void>;
  // Diet state
  dietClient: string;
  setDietClient: (v: string) => void;
  dietSaved: boolean;
  dietLoading: boolean; // NEW: loading state
  newDiet: any;
  setNewDiet: (v: any) => void;
  dietHistory: Record<string, any[]>;
  saveDiet: () => Promise<void>;
}

const TrainerContext = createContext<TrainerContextValue | null>(null);

export function useTrainer() {
  const ctx = useContext(TrainerContext);
  if (!ctx) throw new Error("useTrainer must be used inside TrainerProvider");
  return ctx;
}

export function TrainerProvider({
  children,
  uid,
  name,
  email,
  logout,
  clients,
  trainers,
  instructions,
}: {
  children: React.ReactNode;
  uid: string;
  name: string;
  email: string;
  logout: () => void;
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
}) {
  const [tab, setTab] = useState("clients");
  const [libCat, setLibCat] = useState("Chest");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sessionExercises, setSessionExercises] = useState(
    WORKOUT_LIBRARY["Chest"].slice(0, 3).map((e) => ({
      ...e,
      sets: "3",
      reps: "10",
      weight: "0",
    }))
  );
  const [logClient, setLogClient] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false); // NEW
  const [injuryFlag, setInjuryFlag] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sessionDuration, setSessionDuration] = useState("60");
  const [sessionStatus, setSessionStatus] = useState("Completed");
  const [sessionType, setSessionType] = useState("Strength Training");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionModReason, setSessionModReason] = useState("");

  const [progressClientOverride, setProgressClientOverride] = useState("");
  const [dietClientOverride, setDietClientOverride] = useState("");
  const [progressTab, setProgressTab] = useState("overview");
  const [showLogProgress, setShowLogProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false); // NEW
  const [dietSaved, setDietSaved] = useState(false);
  const [dietLoading, setDietLoading] = useState(false); // NEW

  const [newProgress, setNewProgress] = useState({
    weight: "", bf: "", chest: "", waist: "", hips: "",
    arms: "", thighs: "", squat: "", bench: "", deadlift: "",
    pullup: "", notes: "",
  });
  const [newDiet, setNewDiet] = useState({
    protein: "", water: "", steps: "", sleep: "",
    sleepQuality: "Good", notes: "",
  });
  const [progressHistory, setProgressHistory] = useState<Record<string, any[]>>({});
  const [dietHistory, setDietHistory] = useState<Record<string, any[]>>({});

  // ── Derived ──────────────────────────────────────────────────
  const initials =
    (name || "?")
      .split(" ")
      .map((n: string) => n[0] || "")
      .join("")
      .toUpperCase() || "?";

  const myClients = clients.filter((c: any) => c.trainerId === uid);
  const myTrainer = trainers.find((t: any) => t.id === uid);

  // FIX 3: Filter instructions — show only "all" broadcasts OR instructions targeted at this trainer specifically
  const myInstructions = instructions.filter(
    (i: any) => !i.target || i.target === "all" || i.target === uid
  );

  const progressClient =
    progressClientOverride || myClients[0]?.name || "";
  const setProgressClient = setProgressClientOverride;
  const dietClient = dietClientOverride || myClients[0]?.name || "";
  const setDietClient = setDietClientOverride;

  const myExpiredClients = myClients.filter(
    (c) =>
      c.endDate &&
      new Date(c.endDate) < new Date() &&
      c.status !== "Inactive"
  );
  const myLowClassClients = myClients.filter(
    (c) =>
      (c.classesLeft || 0) <= 2 &&
      (c.sessionsIncluded || 0) > 0 &&
      c.status === "Active"
  );

  // ── Firestore listeners ───────────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    // FIX 4: Filter ONLY by trainerId — removed dangerous name-based fallback
    const unsubProgress = onSnapshot(
      query(collection(db, "progressLogs"), orderBy("createdAt", "asc")),
      (snap) => {
        const grouped: Record<string, any[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.trainerId === uid) { // FIX 4: trainerId only
            if (!grouped[data.clientName]) grouped[data.clientName] = [];
            grouped[data.clientName].push({ ...data, id: d.id });
          }
        });
        setProgressHistory(grouped);
      },
      (error) => {
        console.error("progressLogs listener error:", error);
      }
    );

    const unsubDiet = onSnapshot(
      query(collection(db, "dietLogs"), orderBy("createdAt", "asc")),
      (snap) => {
        const grouped: Record<string, any[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.trainerId === uid) { // FIX 4: trainerId only
            if (!grouped[data.clientName]) grouped[data.clientName] = [];
            grouped[data.clientName].push({ ...data, id: d.id });
          }
        });
        setDietHistory(grouped);
      },
      (error) => {
        console.error("dietLogs listener error:", error);
      }
    );

    return () => {
      unsubProgress();
      unsubDiet();
    };
  }, [uid]);

  // ── Actions ───────────────────────────────────────────────────

  const saveSession = async () => {
    if (!logClient) {
      setSessionError("Please select a client.");
      return;
    }
    if (!sessionNotes.trim()) {
      setSessionError("Quality notes are required.");
      return;
    }
    setSessionError("");
    setSessionLoading(true); // NEW: show loading

    try {
      const dateStr = new Date(sessionDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      const loggedAt = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const now = new Date();
      const sessionDateTime = new Date(sessionDate);
      const hoursDiff =
        (now.getTime() - sessionDateTime.getTime()) / (1000 * 60 * 60);
      const isLate = hoursDiff > 2;

      const sessionData = {
        client: logClient,
        trainer: name,
        trainerId: uid,
        date: dateStr,
        loggedAt,
        type: sessionType,
        status: sessionStatus.toLowerCase().split(" ")[0],
        duration: Number(sessionDuration) || 0,
        late: isLate,
        notes: sessionNotes,
        modReason: sessionModReason,
        injuryFlag: injuryFlag || null,
        exercises: sessionExercises.map((e) => ({
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
        })),
        createdAt: serverTimestamp(),
      };

      // FIX 1: Write ONLY to top-level sessionLogs — removed subcollection double-write
      await addDoc(collection(db, "sessionLogs"), sessionData);

      // Update client doc
      const client = myClients.find((c) => c.name === logClient);
      if (client?.id) {
        const isMissed =
          sessionStatus.toLowerCase().includes("missed") ||
          sessionStatus.toLowerCase().includes("cancelled");
        const newSessionsLogged = isMissed
          ? client.sessionsLogged || 0
          : (client.sessionsLogged || 0) + 1;
        const newClassesLeft = Math.max(
          0,
          (client.sessionsIncluded || 0) - newSessionsLogged
        );
        const newCompliance =
          client.sessionsIncluded > 0
            ? Math.round((newSessionsLogged / client.sessionsIncluded) * 100)
            : 0;

        const clientUpdates: any = {
          lastSession: dateStr,
          lateLog: isLate,
          sessionsLogged: newSessionsLogged,
          classesLeft: newClassesLeft,
          compliance: newCompliance,
          updatedAt: serverTimestamp(),
        };
        if (isMissed)
          clientUpdates.missedSessions = (client.missedSessions || 0) + 1;

        await updateDoc(
          doc(db, "trainers", uid, "clients", client.id),
          clientUpdates
        );
      }

      // FIX 2: Increment trainer's session count atomically
      const trainerUpdates: any = {
        sessions: increment(1),
        updatedAt: serverTimestamp(),
      };
      if (isLate) {
        trainerUpdates.lateSubmissions = increment(1);
      }
      await updateDoc(doc(db, "trainers", uid), trainerUpdates);

      // Reset form
      setSessionSaved(true);
      setSessionNotes("");
      setSessionModReason("");
      setInjuryFlag("");
      setTimeout(() => setSessionSaved(false), 3000);
    } catch (err: any) {
      console.error("saveSession error:", err);
      setSessionError("Failed to save session. Please try again.");
    } finally {
      setSessionLoading(false); // NEW: always clear loading
    }
  };

  const saveProgress = async (last?: any) => {
    if (!progressClient) return;
    setProgressLoading(true); // NEW
    try {
      await addDoc(collection(db, "progressLogs"), {
        clientName: progressClient,
        trainer: name,
        trainerId: uid,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        ...Object.fromEntries(
          Object.entries(newProgress).map(([k, v]) => [
            k,
            Number(v) || (last ? (last as any)[k] : 0) || 0,
          ])
        ),
        createdAt: serverTimestamp(),
      });
      setProgressSaved(true);
      setShowLogProgress(false);
      setNewProgress({
        weight: "", bf: "", chest: "", waist: "", hips: "",
        arms: "", thighs: "", squat: "", bench: "", deadlift: "",
        pullup: "", notes: "",
      });
      setTimeout(() => setProgressSaved(false), 3000);
    } catch (err) {
      console.error("saveProgress error:", err);
    } finally {
      setProgressLoading(false); // NEW
    }
  };

  const saveDiet = async () => {
    if (!dietClient) return;
    setDietLoading(true); // NEW
    try {
      await addDoc(collection(db, "dietLogs"), {
        clientName: dietClient,
        trainer: name,
        trainerId: uid,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        protein: Number(newDiet.protein) || 0,
        water: Number(newDiet.water) || 0,
        steps: Number(newDiet.steps) || 0,
        sleep: Number(newDiet.sleep) || 0,
        sleepQuality: newDiet.sleepQuality,
        notes: newDiet.notes,
        createdAt: serverTimestamp(),
      });
      setDietSaved(true);
      setNewDiet({
        protein: "", water: "", steps: "", sleep: "",
        sleepQuality: "Good", notes: "",
      });
      setTimeout(() => setDietSaved(false), 3000);
    } catch (err) {
      console.error("saveDiet error:", err);
    } finally {
      setDietLoading(false); // NEW
    }
  };

  return (
    <TrainerContext.Provider
      value={{
        uid, name, email, logout, initials,
        clients, trainers, instructions,
        myClients, myTrainer, myExpiredClients, myLowClassClients,
        myInstructions, // FIX 3: now filtered
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
        saveSession,
        libCat, setLibCat,
        progressClient, setProgressClient,
        progressTab, setProgressTab,
        showLogProgress, setShowLogProgress,
        progressSaved, progressLoading,
        newProgress, setNewProgress,
        progressHistory,
        saveProgress,
        dietClient, setDietClient,
        dietSaved, dietLoading,
        newDiet, setNewDiet,
        dietHistory,
        saveDiet,
      }}
    >
      {children}
    </TrainerContext.Provider>
  );
}
