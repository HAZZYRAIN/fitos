"use client";
// ============================================================
// ADMIN CONTEXT
// All admin state + actions live here.
// Every tab imports useAdmin() — no prop drilling.
// ============================================================
import { createContext, useContext, useState } from "react";
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

// ── Types ────────────────────────────────────────────────────
export interface AdminContextValue {
  // Identity
  name: string;
  logout: () => void;
  // Live data
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];
  // Derived
  totalRevenue: number;
  pendingLogs: number;
  flaggedClients: Client[];
  expiredClients: Client[];
  lowClassClients: Client[];
  atRiskClients: Client[];
  lowAttendance: Client[];
  todayStr: string;
  todaySessions: SessionLog[];
  avgAccountability: number;
  // Tab navigation
  tab: string;
  setTab: (t: string) => void;
  // Modal visibility
  showAddTrainer: boolean; setShowAddTrainer: (v: boolean) => void;
  showAddClient: boolean;  setShowAddClient:  (v: boolean) => void;
  showInstruction: boolean; setShowInstruction: (v: boolean) => void;
  showWarning: boolean;    setShowWarning:    (v: boolean) => void;
  showChangePw: boolean;   setShowChangePw:   (v: boolean) => void;
  showEditClient: boolean; setShowEditClient: (v: boolean) => void;
  // Selected items
  selectedTrainer: Trainer | null; setSelectedTrainer: (t: Trainer | null) => void;
  selectedClient:  Client  | null; setSelectedClient:  (c: Client  | null) => void;
  pwTarget: Trainer | null; setPwTarget: (t: Trainer | null) => void;
  // Form state
  newTrainer: { name: string; email: string; speciality: string; plan: string };
  setNewTrainer: (v: any) => void;
  newClient: { name: string; email: string; gender: string; age: string; trainerId: string; trainerName: string; programType: string; status: string; medicalNotes: string; startDate: string; endDate: string; sessionsIncluded: string; plan: string; location: string };
  setNewClient: (v: any) => void;
  newInstruction: { title: string; body: string; priority: string };
  setNewInstruction: (v: any) => void;
  newWarning: { trainer: string; type: string; note: string; followUp: string };
  setNewWarning: (v: any) => void;
  pwForm: { newPw: string; confirmPw: string };
  setPwForm: (v: any) => void;
  pwMsg: string; setPwMsg: (v: string) => void;
  editForm: any; setEditForm: (v: any) => void;
  // Filters
  clientSearch: string; setClientSearch: (v: string) => void;
  trainerFilter: string; setTrainerFilter: (v: string) => void;
  clientStatusFilter: string; setClientStatusFilter: (v: string) => void;
  filteredClients: Client[];
  // Actions
  addTrainer: () => Promise<void>;
  addClient: () => Promise<void>;
  saveEditClient: () => Promise<void>;
  toggleClientStatus: (clientId: string, trainerId: string, currentStatus: string) => Promise<void>;
  postInstruction: () => Promise<void>;
  deleteInstruction: (id: string) => Promise<void>;
  addWarning: () => Promise<void>;
  changePassword: () => void;
  toggleTrainerStatus: (trainerId: string, currentStatus: string) => Promise<void>;
  openEditClient: (c: Client) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────
export function AdminProvider({
  children,
  name,
  logout,
  clients,
  trainers,
  instructions,
  warnings,
  sessionLogs,
}: {
  children: React.ReactNode;
  name: string;
  logout: () => void;
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];
}) {
  // ── Tab ──
  const [tab, setTab] = useState("overview");

  // ── Modals ──
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  // ── Selected ──
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [pwTarget, setPwTarget] = useState<Trainer | null>(null);

  // ── Forms ──
  const [newTrainer, setNewTrainer] = useState({ name: "", email: "", speciality: "", plan: "Starter" });
  const [newClient, setNewClient] = useState({ name: "", email: "", gender: "", age: "", trainerId: "", trainerName: "", programType: "1-on-1", status: "Active", medicalNotes: "", startDate: "", endDate: "", sessionsIncluded: "", plan: "", location: "" });
  const [newInstruction, setNewInstruction] = useState({ title: "", body: "", priority: "medium" });
  const [newWarning, setNewWarning] = useState({ trainer: "", type: "Verbal Warning", note: "", followUp: "" });
  const [pwForm, setPwForm] = useState({ newPw: "", confirmPw: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [editForm, setEditForm] = useState<any>({});

  // ── Filters ──
  const [clientSearch, setClientSearch] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [clientStatusFilter, setClientStatusFilter] = useState("all");

  // ── Derived ──
  const todayDate = new Date();
  const totalRevenue = trainers.reduce((s, t) => s + (t.revenue || 0), 0);
  const pendingLogs = trainers.reduce((s, t) => s + (t.pendingLogs || 0), 0);
  const flaggedClients = clients.filter((c) => c.medicalNotes);
  const expiredClients = clients.filter((c) => c.endDate && new Date(c.endDate) < todayDate && c.status !== "Inactive");
  const lowClassClients = clients.filter((c) => (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0 && c.status === "Active");
  const atRiskClients = clients.filter((c) => {
    const expired = c.endDate && new Date(c.endDate) < todayDate && c.status !== "Inactive";
    const lowClasses = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
    return expired || lowClasses || (c.compliance || 0) < 75;
  });
  const lowAttendance = clients.filter((c) => (c.compliance || 0) < 70);
  const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const todaySessions = sessionLogs.filter((s) => s.date === todayStr);
  const avgAccountability = trainers.length
    ? Math.round(trainers.reduce((s, t) => s + (t.accountabilityScore || 0), 0) / trainers.length)
    : 0;
  const filteredClients = clients.filter((c) => {
    const n = (c.name || "").toLowerCase();
    const tr = (c.trainerName || "").toLowerCase();
    const search = clientSearch.toLowerCase();
    const matchSearch = n.includes(search) || tr.includes(search);
    const matchTrainer = trainerFilter === "all" || c.trainerName === trainerFilter;
    const matchStatus = clientStatusFilter === "all" || (clientStatusFilter === "active" ? c.status !== "Inactive" : c.status === "Inactive");
    return matchSearch && matchTrainer && matchStatus;
  });

  // ── Actions ──
  const addTrainer = async () => {
    if (!newTrainer.name || !newTrainer.email) return;
    await addDoc(collection(db, "trainers"), {
      name: newTrainer.name, email: newTrainer.email,
      avatar: newTrainer.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      clientCount: 0, retention: 0, revenue: 0, sessions: 0, sessionsAssigned: 0,
      missedSessions: 0, pendingLogs: 0, status: "active", plan: newTrainer.plan,
      speciality: newTrainer.speciality,
      joined: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      rating: 0, accountabilityScore: 100, warnings: 0,
      progressUpdatesThisMonth: 0, lateSubmissions: 0, createdAt: serverTimestamp(),
    });
    setNewTrainer({ name: "", email: "", speciality: "", plan: "Starter" });
    setShowAddTrainer(false);
  };

  const addClient = async () => {
    if (!newClient.name || !newClient.trainerId) return;
    const sessionsIncluded = Number(newClient.sessionsIncluded) || 0;
    await addDoc(collection(db, "trainers", newClient.trainerId, "clients"), {
      name: newClient.name.trim(), email: newClient.email.trim(),
      gender: newClient.gender, age: newClient.age ? Number(newClient.age) : "",
      trainerId: newClient.trainerId, trainerName: newClient.trainerName,
      programType: newClient.programType, status: newClient.status,
      medicalNotes: newClient.medicalNotes, startDate: newClient.startDate,
      endDate: newClient.endDate, plan: newClient.plan,
      sessionsIncluded, sessionsLogged: 0, classesLeft: sessionsIncluded,
      location: newClient.location, compliance: 0,
      progressLastUpdated: "Never", createdAt: serverTimestamp(),
    });
    setNewClient({ name: "", email: "", gender: "", age: "", trainerId: "", trainerName: "", programType: "1-on-1", status: "Active", medicalNotes: "", startDate: "", endDate: "", sessionsIncluded: "", plan: "", location: "" });
    setShowAddClient(false);
  };

  const saveEditClient = async () => {
    if (!editForm.name || !editForm.id || !editForm.trainerId) return;
    const { id, trainerId, ...data } = editForm;
    const sessionsIncluded = Number(data.sessionsIncluded) || 0;
    const sessionsLogged = Number(data.sessionsLogged) || 0;
    const classesLeft = Math.max(0, sessionsIncluded - sessionsLogged);
    const compliance = sessionsIncluded > 0 ? Math.round((sessionsLogged / sessionsIncluded) * 100) : 0;
    await updateDoc(doc(db, "trainers", trainerId, "clients", id), {
      ...data, classesLeft, compliance, updatedAt: serverTimestamp(),
    });
    setShowEditClient(false);
    setSelectedClient({ ...editForm, classesLeft, compliance });
  };

  const toggleClientStatus = async (clientId: string, trainerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await updateDoc(doc(db, "trainers", trainerId, "clients", clientId), { status: newStatus });
    if (selectedClient?.id === clientId) {
      setSelectedClient((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  const postInstruction = async () => {
    if (!newInstruction.title) return;
    await addDoc(collection(db, "instructions"), {
      title: newInstruction.title, body: newInstruction.body,
      priority: newInstruction.priority, by: name,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      createdAt: serverTimestamp(),
    });
    setNewInstruction({ title: "", body: "", priority: "medium" });
    setShowInstruction(false);
  };

  const deleteInstruction = async (id: string) => {
    await deleteDoc(doc(db, "instructions", id));
  };

  const addWarning = async () => {
    if (!newWarning.trainer || !newWarning.note) return;
    await addDoc(collection(db, "warnings"), {
      trainer: newWarning.trainer, type: newWarning.type,
      note: newWarning.note, by: name, followUp: newWarning.followUp,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      createdAt: serverTimestamp(),
    });
    const trainer = trainers.find((t) => t.name === newWarning.trainer);
    if (trainer?.id) {
      await updateDoc(doc(db, "trainers", trainer.id), { warnings: (trainer.warnings || 0) + 1 });
    }
    setNewWarning({ trainer: "", type: "Verbal Warning", note: "", followUp: "" });
    setShowWarning(false);
  };

  const changePassword = () => {
    if (!pwForm.newPw || pwForm.newPw !== pwForm.confirmPw) {
      setPwMsg(pwForm.newPw ? "Passwords do not match." : "Enter a new password.");
      return;
    }
    if (pwForm.newPw.length < 6) { setPwMsg("Min 6 characters."); return; }
    setPwMsg(`✓ Noted for ${pwTarget?.name}. Use Firebase Console → Authentication to change passwords.`);
    setPwForm({ newPw: "", confirmPw: "" });
    setTimeout(() => { setShowChangePw(false); setPwMsg(""); setPwTarget(null); }, 3000);
  };

  const toggleTrainerStatus = async (trainerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await updateDoc(doc(db, "trainers", trainerId), { status: newStatus });
    if (selectedTrainer?.id === trainerId) {
      setSelectedTrainer((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  const openEditClient = (c: Client) => {
    setEditForm({ ...c });
    setShowEditClient(true);
  };

  return (
    <AdminContext.Provider value={{
      name, logout,
      clients, trainers, instructions, warnings, sessionLogs,
      totalRevenue, pendingLogs, flaggedClients, expiredClients,
      lowClassClients, atRiskClients, lowAttendance,
      todayStr, todaySessions, avgAccountability,
      tab, setTab,
      showAddTrainer, setShowAddTrainer,
      showAddClient, setShowAddClient,
      showInstruction, setShowInstruction,
      showWarning, setShowWarning,
      showChangePw, setShowChangePw,
      showEditClient, setShowEditClient,
      selectedTrainer, setSelectedTrainer,
      selectedClient, setSelectedClient,
      pwTarget, setPwTarget,
      newTrainer, setNewTrainer,
      newClient, setNewClient,
      newInstruction, setNewInstruction,
      newWarning, setNewWarning,
      pwForm, setPwForm,
      pwMsg, setPwMsg,
      editForm, setEditForm,
      clientSearch, setClientSearch,
      trainerFilter, setTrainerFilter,
      clientStatusFilter, setClientStatusFilter,
      filteredClients,
      addTrainer, addClient, saveEditClient,
      toggleClientStatus, postInstruction, deleteInstruction,
      addWarning, changePassword, toggleTrainerStatus, openEditClient,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
