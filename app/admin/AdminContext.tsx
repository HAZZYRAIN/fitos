"use client";
import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import type { Client, Trainer, Instruction, Warning, SessionLog } from "../types";

// ── Types ─────────────────────────────────────────────────────
interface AdminContextType {
  name: string;
  logout: () => void;

  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];

  // Filters
  clientSearch: string;
  setClientSearch: (search: string) => void;
  trainerFilter: string;
  setTrainerFilter: (filter: string) => void;
  clientStatusFilter: string;
  setClientStatusFilter: (status: string) => void;

  // Computed lists
  filteredClients: Client[];
  atRiskClients: Client[];
  flaggedClients: Client[];
  lowAttendance: Client[];
  expiredClients: Client[];
  lowClassClients: Client[];
  pendingLogs: number;
  avgAccountability: number;
  todaySessions: SessionLog[];

  // Modal visibility
  showEditClient: boolean;
  setShowEditClient: (show: boolean) => void;
  showAddTrainer: boolean;
  setShowAddTrainer: (show: boolean) => void;
  showAddClient: boolean;
  setShowAddClient: (show: boolean) => void;
  showInstruction: boolean;
  setShowInstruction: (show: boolean) => void;
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
  showRenewClient: boolean;
  setShowRenewClient: (show: boolean) => void;
  showChangePw: boolean;
  setShowChangePw: (show: boolean) => void;

  // Selected records
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  selectedTrainer: Trainer | null;
  setSelectedTrainer: (trainer: Trainer | null) => void;
  renewTarget: Client | null;

  // Forms
  editForm: Partial<Client> | null;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Client> | null>>;
  newTrainer: Partial<Trainer>;
  setNewTrainer: React.Dispatch<React.SetStateAction<Partial<Trainer>>>;
  newClient: Partial<Client>;
  setNewClient: React.Dispatch<React.SetStateAction<Partial<Client>>>;
  newInstruction: Partial<Instruction>;
  setNewInstruction: React.Dispatch<React.SetStateAction<Partial<Instruction>>>;
  newWarning: Partial<Warning>;
  setNewWarning: React.Dispatch<React.SetStateAction<Partial<Warning>>>;
  renewForm: any;
  setRenewForm: React.Dispatch<React.SetStateAction<any>>;
  pwForm: any;
  setPwForm: React.Dispatch<React.SetStateAction<any>>;

  pwTarget: Trainer | null;
  setPwTarget: (trainer: Trainer | null) => void;
  pwMsg: string;
  renewMsg: string;
  renewLoading: boolean;

  toast: { message: string; type: "success" | "error" } | null;
  showToast: (message: string, type: "success" | "error") => void;

  // Actions
  addTrainer: () => Promise<void>;
  addClient: () => Promise<void>;
  saveEditClient: () => Promise<void>;
  renewClient: () => Promise<void>;
  openRenewClient: (client: Client) => void;
  openEditClient: (client: Client) => void;
  postInstruction: () => Promise<void>;
  addWarning: () => Promise<void>;
  changePassword: () => Promise<void>;
  // Dual signature: (id, currentStatus) OR (id, trainerName, newStatus)
  toggleTrainerStatus: (trainerId: string, statusOrName: string, newStatus?: string) => Promise<void>;
  deleteInstruction: (id: string) => Promise<void>;

  tab: string;
  setTab: (tab: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────
export function AdminProvider({
  children,
  name,
  logout,
  clients: initialClients = [],
  trainers: initialTrainers = [],
  instructions: initialInstructions = [],
  warnings: initialWarnings = [],
  sessionLogs: initialSessionLogs = [],
}: {
  children: ReactNode;
  name: string;
  logout: () => void;
  clients?: Client[];
  trainers?: Trainer[];
  instructions?: Instruction[];
  warnings?: Warning[];
  sessionLogs?: SessionLog[];
}) {
  const [clients,      setClients]      = useState<Client[]>(initialClients);
  const [trainers,     setTrainers]     = useState<Trainer[]>(initialTrainers);
  const [instructions, setInstructions] = useState<Instruction[]>(initialInstructions);
  const [warnings,     setWarnings]     = useState<Warning[]>(initialWarnings);
  const [sessionLogs,  setSessionLogs]  = useState<SessionLog[]>(initialSessionLogs);

  // Suppress unused-variable warnings — data flows in via props
  void setClients; void setTrainers; void setInstructions; void setWarnings; void setSessionLogs;

  // Filters
  const [clientSearch,       setClientSearch]       = useState("");
  const [trainerFilter,      setTrainerFilter]      = useState("all");
  const [clientStatusFilter, setClientStatusFilter] = useState("all");

  // Modal state
  const [showEditClient,  setShowEditClient]  = useState(false);
  const [showAddTrainer,  setShowAddTrainer]  = useState(false);
  const [showAddClient,   setShowAddClient]   = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showWarning,     setShowWarning]     = useState(false);
  const [showRenewClient, setShowRenewClient] = useState(false);
  const [showChangePw,    setShowChangePw]    = useState(false);

  // Selected records
  const [selectedClient,  setSelectedClient]  = useState<Client | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [renewTarget,     setRenewTarget]     = useState<Client | null>(null);

  // Form state
  const [editForm,       setEditForm]       = useState<Partial<Client> | null>(null);
  const [newTrainer,     setNewTrainer]     = useState<Partial<Trainer>>({ name: "", email: "", speciality: "", plan: "Starter" });
  const [newClient,      setNewClient]      = useState<Partial<Client>>({ name: "", email: "", gender: "", age: "", trainerId: "", trainerName: "", programType: "1-on-1", status: "Active", medicalNotes: "", startDate: "", endDate: "", sessionsIncluded: 0, plan: "", location: "" });
  const [newInstruction, setNewInstruction] = useState<Partial<Instruction>>({ title: "", body: "", priority: "medium", target: "all" });
  const [newWarning,     setNewWarning]     = useState<Partial<Warning>>({ trainer: "", type: "Verbal Warning", note: "", followUp: "" });
  const [renewForm,      setRenewForm]      = useState<any>({ mode: "add", sessions: "", endDate: "" });
  const [pwForm,         setPwForm]         = useState<any>({ newPw: "", confirmPw: "" });
  const [pwTarget,       setPwTarget]       = useState<Trainer | null>(null);

  const [pwMsg,        setPwMsg]        = useState("");
  const [renewMsg,     setRenewMsg]     = useState("");
  const [renewLoading, setRenewLoading] = useState(false);
  const [toast,        setToast]        = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [tab,          setTab]          = useState("overview");

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Computed lists ────────────────────────────────────────────

  const filteredClients = useMemo(() => clients.filter((c) => {
    const matchSearch  = c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                         c.trainerName?.toLowerCase().includes(clientSearch.toLowerCase());
    const matchTrainer = trainerFilter === "all" || c.trainerName === trainerFilter;
    const matchStatus  = clientStatusFilter === "all" || c.status === clientStatusFilter;
    return matchSearch && matchTrainer && matchStatus;
  }), [clients, clientSearch, trainerFilter, clientStatusFilter]);

  const atRiskClients = useMemo(() => clients.filter((c) => {
    const expired       = c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive";
    const lowClasses    = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
    const lowCompliance = (c.sessionsLogged || 0) > 0 && (c.compliance || 0) < 75;
    return expired || lowClasses || lowCompliance;
  }), [clients]);

  const flaggedClients = useMemo(() => clients.filter((c) =>
    !!c.medicalNotes || !!c.injuryFlag
  ), [clients]);

  const lowAttendance = useMemo(() => clients.filter((c) =>
    (c.sessionsLogged || 0) > 0 && (c.compliance || 0) < 70
  ), [clients]);

  const expiredClients = useMemo(() => clients.filter((c) =>
    c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive"
  ), [clients]);

  const lowClassClients = useMemo(() => clients.filter((c) =>
    (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0
  ), [clients]);

  const pendingLogs = useMemo(() =>
    sessionLogs.filter((s) => s.status === "pending").length
  , [sessionLogs]);

  // Average accountability score across all trainers
  const avgAccountability = useMemo(() => {
    if (!trainers.length) return 0;
    return Math.round(
      trainers.reduce((s, t) => s + (t.accountabilityScore || 0), 0) / trainers.length
    );
  }, [trainers]);

  // Today's sessions — matches YYYY-MM-DD format stored in Firestore
  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return sessionLogs.filter((s) => s.date === today);
  }, [sessionLogs]);

  // ── Actions ───────────────────────────────────────────────────

  const addTrainer = useCallback(async () => {
    if (!newTrainer.name?.trim() || !newTrainer.email?.trim()) {
      showToast("Name and email required", "error"); return;
    }
    try {
      await addDoc(collection(db, "trainers"), {
        name: newTrainer.name.trim(),
        email: newTrainer.email.trim(),
        speciality: newTrainer.speciality || "",
        plan: newTrainer.plan || "Starter",
        status: "active",
        rating: 0, sessions: 0, clientCount: 0,
        lateSubmissions: 0, accountabilityScore: 100,
        revenue: 0, retention: 0, warnings: 0,
        missedSessions: 0, pendingLogs: 0,
        progressUpdatesThisMonth: 0, sessionsAssigned: 0,
        joined: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        createdAt: serverTimestamp(),
      });
      setNewTrainer({ name: "", email: "", speciality: "", plan: "Starter" });
      setShowAddTrainer(false);
      showToast("✓ Trainer added!", "success");
    } catch {
      showToast("Failed to add trainer", "error");
    }
  }, [newTrainer, showToast]);

  const addClient = useCallback(async () => {
    if (!newClient.name?.trim() || !newClient.trainerId) {
      showToast("Name and trainer required", "error"); return;
    }
    const sessionsIncluded = Number(newClient.sessionsIncluded) || 12;
    const clientName = newClient.name.trim();
    const trainerId  = newClient.trainerId;
    try {
      const docRef = await addDoc(collection(db, "trainers", trainerId, "clients"), {
        name: clientName,
        email: newClient.email?.trim() || "",
        gender: newClient.gender || "",
        age: newClient.age ? Number(newClient.age) : null,
        trainerId,
        trainerName: newClient.trainerName || "",
        programType: newClient.programType || "1-on-1",
        status: newClient.status || "Active",
        medicalNotes: newClient.medicalNotes || "",
        startDate: newClient.startDate || "",
        endDate: newClient.endDate || "",
        plan: newClient.plan || "",
        location: newClient.location || "",
        sessionsIncluded,
        sessionsLogged: 0,
        classesLeft: sessionsIncluded,
        compliance: 0,
        missedSessions: 0,
        lastSession: null,
        lateLog: false,
        createdAt: serverTimestamp(),
      });
      await updateDoc(docRef, { id: docRef.id });
      setNewClient({ name: "", email: "", gender: "", age: "", trainerId: "", trainerName: "", programType: "1-on-1", status: "Active", medicalNotes: "", startDate: "", endDate: "", sessionsIncluded: 0, plan: "", location: "" });
      setShowAddClient(false);
      showToast(`✓ Client "${clientName}" added!`, "success");
    } catch {
      showToast("Failed to add client", "error");
    }
  }, [newClient, showToast]);

  const openEditClient = useCallback((client: Client) => {
    setEditForm(client);
    setShowEditClient(true);
  }, []);

  const saveEditClient = useCallback(async () => {
    if (!editForm?.id || !editForm?.trainerId) return;
    try {
      await updateDoc(
        doc(db, "trainers", editForm.trainerId, "clients", editForm.id),
        { ...editForm, updatedAt: serverTimestamp() }
      );
      setShowEditClient(false);
      setEditForm(null);
      showToast("✓ Client updated", "success");
    } catch {
      showToast("Failed to update client", "error");
    }
  }, [editForm, showToast]);

  const openRenewClient = useCallback((client: Client) => {
    setRenewTarget(client);
    setShowRenewClient(true);
    setRenewForm({ mode: "add", sessions: "", endDate: "" });
    setRenewMsg("");
  }, []);

  const renewClient = useCallback(async () => {
    if (!renewTarget?.id || !renewTarget?.trainerId || !renewForm.sessions || !renewForm.endDate) {
      setRenewMsg("Please fill all fields"); return;
    }
    setRenewLoading(true);
    try {
      const newSessions = Number(renewForm.sessions);
      const clientRef   = doc(db, "trainers", renewTarget.trainerId, "clients", renewTarget.id);
      if (renewForm.mode === "add") {
        await updateDoc(clientRef, {
          sessionsIncluded: (renewTarget.sessionsIncluded || 0) + newSessions,
          classesLeft:      (renewTarget.classesLeft || 0) + newSessions,
          endDate: renewForm.endDate,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(clientRef, {
          sessionsIncluded: newSessions,
          sessionsLogged: 0,
          classesLeft: newSessions,
          compliance: 0,
          missedSessions: 0,
          endDate: renewForm.endDate,
          updatedAt: serverTimestamp(),
        });
      }
      setRenewMsg("✓ Renewal complete!");
      setTimeout(() => { setShowRenewClient(false); setRenewTarget(null); }, 1500);
    } catch {
      setRenewMsg("✕ Failed to renew");
    } finally {
      setRenewLoading(false);
    }
  }, [renewTarget, renewForm]);

  const postInstruction = useCallback(async () => {
    if (!newInstruction.title?.trim()) { showToast("Title required", "error"); return; }
    try {
      await addDoc(collection(db, "instructions"), {
        ...newInstruction,
        createdAt: serverTimestamp(),
      });
      setNewInstruction({ title: "", body: "", priority: "medium", target: "all" });
      setShowInstruction(false);
      showToast("✓ Instruction posted", "success");
    } catch {
      showToast("Failed to post instruction", "error");
    }
  }, [newInstruction, showToast]);

  const addWarning = useCallback(async () => {
    if (!newWarning.trainer?.trim() || !newWarning.note?.trim()) {
      showToast("Trainer and note required", "error"); return;
    }
    try {
      await addDoc(collection(db, "warnings"), {
        ...newWarning,
        createdAt: serverTimestamp(),
      });
      setNewWarning({ trainer: "", type: "Verbal Warning", note: "", followUp: "" });
      setShowWarning(false);
      showToast("✓ Warning logged", "success");
    } catch {
      showToast("Failed to log warning", "error");
    }
  }, [newWarning, showToast]);

  const changePassword = useCallback(async () => {
    if (!pwForm.newPw || !pwForm.confirmPw || pwForm.newPw !== pwForm.confirmPw) {
      setPwMsg("✕ Passwords don't match"); return;
    }
    if (pwForm.newPw.length < 6) { setPwMsg("✕ Minimum 6 characters"); return; }
    setPwMsg("✓ Use Firebase Console → Authentication to change passwords");
  }, [pwForm]);

  /**
   * Dual-signature toggle:
   *   TrainersList  → toggleTrainerStatus(id, currentStatus)       — toggles automatically
   *   Internal use  → toggleTrainerStatus(id, trainerName, status) — sets explicitly
   */
  const toggleTrainerStatus = useCallback(async (
    trainerId: string,
    statusOrName: string,
    newStatus?: string,
  ) => {
    const resolved = newStatus !== undefined
      ? newStatus
      : (statusOrName === "active" ? "suspended" : "active");
    const label = resolved === "active" ? "activated" : "suspended";
    try {
      await updateDoc(doc(db, "trainers", trainerId), {
        status: resolved,
        updatedAt: serverTimestamp(),
      });
      showToast(`✓ Trainer ${label}`, "success");
    } catch {
      showToast("Failed to update trainer status", "error");
    }
  }, [showToast]);

  const deleteInstruction = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "instructions", id));
      showToast("✓ Instruction deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
  }, [showToast]);

  // ── Context value ─────────────────────────────────────────────
  const value: AdminContextType = {
    name, logout,
    clients, trainers, instructions, warnings, sessionLogs,

    clientSearch, setClientSearch,
    trainerFilter, setTrainerFilter,
    clientStatusFilter, setClientStatusFilter,

    filteredClients,
    atRiskClients,
    flaggedClients,
    lowAttendance,
    expiredClients,
    lowClassClients,
    pendingLogs,
    avgAccountability,
    todaySessions,

    showEditClient,  setShowEditClient,
    showAddTrainer,  setShowAddTrainer,
    showAddClient,   setShowAddClient,
    showInstruction, setShowInstruction,
    showWarning,     setShowWarning,
    showRenewClient, setShowRenewClient,
    showChangePw,    setShowChangePw,

    selectedClient,  setSelectedClient,
    selectedTrainer, setSelectedTrainer,
    renewTarget,

    editForm,       setEditForm,
    newTrainer,     setNewTrainer,
    newClient,      setNewClient,
    newInstruction, setNewInstruction,
    newWarning,     setNewWarning,
    renewForm,      setRenewForm,
    pwForm,         setPwForm,
    pwTarget,       setPwTarget,

    pwMsg, renewMsg, renewLoading,
    toast, showToast,

    addTrainer,
    addClient,
    saveEditClient,
    renewClient,
    openRenewClient,
    openEditClient,
    postInstruction,
    addWarning,
    changePassword,
    toggleTrainerStatus,
    deleteInstruction,

    tab, setTab,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
