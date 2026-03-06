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
  onSnapshot,
  query,
  where,
  increment,
} from "firebase/firestore";
import type { Client, Trainer, Instruction, Warning, SessionLog } from "../types";

// Types
interface AdminContextType {
  name: string;
  logout: () => void;
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];
  clientSearch: string;
  setClientSearch: (search: string) => void;
  trainerFilter: string;
  setTrainerFilter: (filter: string) => void;
  clientStatusFilter: string;
  setClientStatusFilter: (status: string) => void;
  filteredClients: Client[];
  atRiskClients: Client[];
  expiredClients: Client[];
  lowClassClients: Client[];
  pendingLogs: number;
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
  selectedTrainer: Trainer | null;
  setSelectedTrainer: (trainer: Trainer | null) => void;
  renewTarget: Client | null;
  editForm: Partial<Client> | null;
  setEditForm: (form: Partial<Client> | null) => void;
  newTrainer: Partial<Trainer>;
  setNewTrainer: (trainer: Partial<Trainer>) => void;
  newClient: Partial<Client>;
  setNewClient: (client: Partial<Client>) => void;
  newInstruction: Partial<Instruction>;
  setNewInstruction: (instruction: Partial<Instruction>) => void;
  newWarning: Partial<Warning>;
  setNewWarning: (warning: Partial<Warning>) => void;
  renewForm: any;
  setRenewForm: (form: any) => void;
  pwForm: any;
  setPwForm: (form: any) => void;
  pwTarget: Trainer | null;
  setPwTarget: (trainer: Trainer | null) => void;
  pwMsg: string;
  renewMsg: string;
  renewLoading: boolean;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (message: string, type: "success" | "error") => void;
  addTrainer: () => Promise<void>;
  addClient: () => Promise<void>;
  saveEditClient: () => Promise<void>;
  renewClient: () => Promise<void>;
  openRenewClient: (client: Client) => void;
  openEditClient: (client: Client) => void;
  postInstruction: () => Promise<void>;
  addWarning: () => Promise<void>;
  changePassword: () => Promise<void>;
  toggleTrainerStatus: (trainerId: string, trainerName: string, newStatus: string) => Promise<void>;
  deleteInstruction: (id: string) => Promise<void>;
  tab: string;
  setTab: (tab: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

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
  // State
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [instructions, setInstructions] = useState<Instruction[]>(initialInstructions);
  const [warnings, setWarnings] = useState<Warning[]>(initialWarnings);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(initialSessionLogs);

  const [clientSearch, setClientSearch] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [clientStatusFilter, setClientStatusFilter] = useState("all");

  const [showEditClient, setShowEditClient] = useState(false);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showRenewClient, setShowRenewClient] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [renewTarget, setRenewTarget] = useState<Client | null>(null);

  const [editForm, setEditForm] = useState<Partial<Client> | null>(null);
  const [newTrainer, setNewTrainer] = useState<Partial<Trainer>>({
    name: "",
    email: "",
    speciality: "",
    plan: "Starter",
  });
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    gender: "",
    age: "",
    trainerId: "",
    trainerName: "",
    programType: "1-on-1",
    status: "Active",
    medicalNotes: "",
    startDate: "",
    endDate: "",
    sessionsIncluded: "",
    plan: "",
    location: "",
  });
  const [newInstruction, setNewInstruction] = useState<Partial<Instruction>>({
    title: "",
    body: "",
    priority: "medium",
    target: "all",
  });
  const [newWarning, setNewWarning] = useState<Partial<Warning>>({
    trainer: "",
    type: "Verbal Warning",
    note: "",
    followUp: "",
  });

  const [renewForm, setRenewForm] = useState({ mode: "add", sessions: "", endDate: "" });
  const [pwForm, setPwForm] = useState({ newPw: "", confirmPw: "" });
  const [pwTarget, setPwTarget] = useState<Trainer | null>(null);
  const [pwMsg, setPwMsg] = useState("");
  const [renewMsg, setRenewMsg] = useState("");
  const [renewLoading, setRenewLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [tab, setTab] = useState("overview");

  // Toast handler
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.trainerName?.toLowerCase().includes(clientSearch.toLowerCase());
      const matchesTrainer = trainerFilter === "all" || c.trainerName === trainerFilter;
      const matchesStatus = clientStatusFilter === "all" || c.status === clientStatusFilter;
      return matchesSearch && matchesTrainer && matchesStatus;
    });
  }, [clients, clientSearch, trainerFilter, clientStatusFilter]);

  // At-risk clients (✅ FIXED: Only flag if they've logged sessions)
  const atRiskClients = useMemo(() => {
    return clients.filter((c) => {
      if (!c) return false;
      const expired = c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive";
      const lowClasses = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
      const lowCompliance = (c.sessionsLogged || 0) > 0 && (c.compliance || 0) < 75;
      return expired || lowClasses || lowCompliance;
    });
  }, [clients]);

  // Expired clients
  const expiredClients = useMemo(() => {
    return clients.filter((c) => c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive");
  }, [clients]);

  // Low sessions clients
  const lowClassClients = useMemo(() => {
    return clients.filter((c) => (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0);
  }, [clients]);

  // Pending logs
  const pendingLogs = useMemo(() => {
    return sessionLogs.filter((s) => s.status === "pending").length;
  }, [sessionLogs]);

  // Functions
  const addTrainer = useCallback(async () => {
    if (!newTrainer.name?.trim() || !newTrainer.email?.trim()) return;
    try {
      await addDoc(collection(db, "trainers"), {
        name: newTrainer.name.trim(),
        email: newTrainer.email.trim(),
        speciality: newTrainer.speciality || "",
        plan: newTrainer.plan || "Starter",
        status: "active",
        rating: 0,
        sessions: 0,
        clientCount: 0,
        lateSubmissions: 0,
        accountabilityScore: 100,
        revenue: 0,
        retention: 0,
        warnings: 0,
        missedSessions: 0,
        pendingLogs: 0,
        progressUpdatesThisMonth: 0,
        sessionsAssigned: 0,
        joined: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        createdAt: serverTimestamp(),
      });
      setNewTrainer({ name: "", email: "", speciality: "", plan: "Starter" });
      setShowAddTrainer(false);
      showToast("Trainer added successfully!", "success");
    } catch (err) {
      showToast("Failed to add trainer", "error");
    }
  }, [newTrainer, showToast]);

  const addClient = useCallback(async () => {
    if (!newClient.name?.trim() || !newClient.trainerId) {
      showToast("Please fill required fields", "error");
      return;
    }

    const sessionsIncluded = Number(newClient.sessionsIncluded) || 12;
    const clientName = newClient.name.trim();
    const trainerId = newClient.trainerId;

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
        // ✅ FIXED: Initialize these fields
        sessionsLogged: 0,
        classesLeft: sessionsIncluded,
        compliance: 0,
        missedSessions: 0,
        lastSession: null,
        lateLog: false,
        createdAt: serverTimestamp(),
      });

      await updateDoc(docRef, { id: docRef.id });

      setNewClient({
        name: "",
        email: "",
        gender: "",
        age: "",
        trainerId: "",
        trainerName: "",
        programType: "1-on-1",
        status: "Active",
        medicalNotes: "",
        startDate: "",
        endDate: "",
        sessionsIncluded: "",
        plan: "",
        location: "",
      });

      setShowAddClient(false);
      showToast(`✓ Client "${clientName}" added!`, "success");
    } catch (err) {
      showToast("Failed to add client", "error");
    }
  }, [newClient, showToast]);

  const openEditClient = useCallback(
    (client: Client) => {
      setEditForm(client);
      setShowEditClient(true);
    },
    []
  );

  const saveEditClient = useCallback(async () => {
    if (!editForm?.id || !editForm?.trainerId) return;
    try {
      await updateDoc(doc(db, "trainers", editForm.trainerId, "clients", editForm.id), {
        ...editForm,
        updatedAt: serverTimestamp(),
      });
      setShowEditClient(false);
      setEditForm(null);
      showToast("✓ Client updated", "success");
    } catch (err) {
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
      setRenewMsg("Please fill all fields");
      return;
    }

    setRenewLoading(true);
    try {
      const newSessions = Number(renewForm.sessions);
      if (renewForm.mode === "add") {
        await updateDoc(doc(db, "trainers", renewTarget.trainerId, "clients", renewTarget.id), {
          sessionsIncluded: (renewTarget.sessionsIncluded || 0) + newSessions,
          classesLeft: (renewTarget.classesLeft || 0) + newSessions,
          endDate: renewForm.endDate,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "trainers", renewTarget.trainerId, "clients", renewTarget.id), {
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
      setTimeout(() => {
        setShowRenewClient(false);
        setRenewTarget(null);
      }, 1500);
    } catch (err) {
      setRenewMsg("✕ Failed to renew");
    } finally {
      setRenewLoading(false);
    }
  }, [renewTarget, renewForm]);

  const postInstruction = useCallback(async () => {
    if (!newInstruction.title?.trim()) {
      showToast("Title required", "error");
      return;
    }
    try {
      await addDoc(collection(db, "instructions"), {
        ...newInstruction,
        createdAt: serverTimestamp(),
      });
      setNewInstruction({ title: "", body: "", priority: "medium", target: "all" });
      setShowInstruction(false);
      showToast("✓ Instruction posted", "success");
    } catch (err) {
      showToast("Failed to post", "error");
    }
  }, [newInstruction, showToast]);

  const addWarning = useCallback(async () => {
    if (!newWarning.trainer?.trim() || !newWarning.note?.trim()) {
      showToast("Trainer and note required", "error");
      return;
    }
    try {
      await addDoc(collection(db, "warnings"), {
        ...newWarning,
        createdAt: serverTimestamp(),
      });
      setNewWarning({ trainer: "", type: "Verbal Warning", note: "", followUp: "" });
      setShowWarning(false);
      showToast("✓ Warning logged", "success");
    } catch (err) {
      showToast("Failed to log warning", "error");
    }
  }, [newWarning, showToast]);

  const changePassword = useCallback(async () => {
    if (!pwForm.newPw || !pwForm.confirmPw || pwForm.newPw !== pwForm.confirmPw) {
      setPwMsg("✕ Passwords don't match");
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg("✕ Password must be 6+ characters");
      return;
    }
    setPwMsg("✓ Use Firebase Console to change in production");
  }, [pwForm]);

  const toggleTrainerStatus = useCallback(
    async (trainerId: string, trainerName: string, newStatus: string) => {
      try {
        await updateDoc(doc(db, "trainers", trainerId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        showToast(`✓ ${trainerName} ${newStatus}`, "success");
      } catch (err) {
        showToast("Failed to update status", "error");
      }
    },
    [showToast]
  );

  const deleteInstruction = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(db, "instructions", id));
        showToast("✓ Deleted", "success");
      } catch (err) {
        showToast("Failed to delete", "error");
      }
    },
    [showToast]
  );

  const value: AdminContextType = {
    name,
    logout,
    clients,
    trainers,
    instructions,
    warnings,
    sessionLogs,
    clientSearch,
    setClientSearch,
    trainerFilter,
    setTrainerFilter,
    clientStatusFilter,
    setClientStatusFilter,
    filteredClients,
    atRiskClients,
    expiredClients,
    lowClassClients,
    pendingLogs,
    showEditClient,
    setShowEditClient,
    showAddTrainer,
    setShowAddTrainer,
    showAddClient,
    setShowAddClient,
    showInstruction,
    setShowInstruction,
    showWarning,
    setShowWarning,
    showRenewClient,
    setShowRenewClient,
    showChangePw,
    setShowChangePw,
    selectedTrainer,
    setSelectedTrainer,
    renewTarget,
    editForm,
    setEditForm,
    newTrainer,
    setNewTrainer,
    newClient,
    setNewClient,
    newInstruction,
    setNewInstruction,
    newWarning,
    setNewWarning,
    renewForm,
    setRenewForm,
    pwForm,
    setPwForm,
    pwTarget,
    setPwTarget,
    pwMsg,
    renewMsg,
    renewLoading,
    toast,
    showToast,
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
    tab,
    setTab,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
