"use client";
// ============================================================
// YOURTRAINER — APP ROUTER
// This file's only job: decide which dashboard to show.
// Admin → <Admin />
// Trainer → <Trainer />
// Logged out → <Login />
//
// All shared code now lives in:
//   app/types/index.ts         — TypeScript interfaces
//   app/styles/dashboard.ts    — CSS
//   app/data/workoutLibrary.ts — Exercise data
//   app/data/templates.ts      — Workout templates
//   app/components/ui/Charts.tsx
//   app/components/Login.tsx
//   app/lib/firebase-hooks.ts  — Firestore listeners
//
// Part 2: Admin tabs split into app/admin/
// Part 3: Trainer tabs split into app/trainer/
// ============================================================
import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  collectionGroup,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

// ── Foundation imports ──
import { S } from "./styles/dashboard";
import { WORKOUT_LIBRARY, WORKOUT_CATEGORIES } from "./data/workoutLibrary";
import { APPROVED_TEMPLATES } from "./data/templates";
import { LineChart, BarChart, ScoreRing, Donut } from "./components/ui/Charts";
import Login from "./components/Login";
import type {
  Client,
  Trainer,
  Instruction,
  Warning,
  SessionLog,
} from "./types";

// ============================================================
// ADMIN DASHBOARD
// (Will be moved to app/admin/ in Part 2)
// ============================================================
function Admin({
  name,
  logout,
  clients,
  trainers,
  instructions,
  warnings,
  sessionLogs,
}: {
  name: string;
  logout: () => void;
  clients: Client[];
  trainers: Trainer[];
  instructions: Instruction[];
  warnings: Warning[];
  sessionLogs: SessionLog[];
}) {
  const [tab, setTab] = useState("overview");

  // Modal visibility
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  // Selected items
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [pwTarget, setPwTarget] = useState<Trainer | null>(null);

  // Form state
  const [newTrainer, setNewTrainer] = useState({ name: "", email: "", speciality: "", plan: "Starter" });
  const [newClient, setNewClient] = useState({ name: "", email: "", gender: "", age: "", trainerId: "", trainerName: "", programType: "1-on-1", status: "Active", medicalNotes: "", startDate: "", endDate: "", sessionsIncluded: "", plan: "", location: "" });
  const [newInstruction, setNewInstruction] = useState({ title: "", body: "", priority: "medium" });
  const [newWarning, setNewWarning] = useState({ trainer: "", type: "Verbal Warning", note: "", followUp: "" });
  const [pwForm, setPwForm] = useState({ newPw: "", confirmPw: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [editForm, setEditForm] = useState<any>({});

  // Filters
  const [clientSearch, setClientSearch] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [clientStatusFilter, setClientStatusFilter] = useState("all");

  // ── Derived values ──
  const totalRevenue = trainers.reduce((s, t) => s + (t.revenue || 0), 0);
  const pendingLogs = trainers.reduce((s, t) => s + (t.pendingLogs || 0), 0);
  const flaggedClients = clients.filter((c) => c.medicalNotes);
  const todayDate = new Date();
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
  const revData = [
    { l: "Sep", v: 98000 }, { l: "Oct", v: 112000 }, { l: "Nov", v: 128000 },
    { l: "Dec", v: 118000 }, { l: "Jan", v: 142000 }, { l: "Feb", v: 162400 },
  ];

  const navItems = [
    { id: "overview", icon: "◼", label: "Control Room" },
    { id: "trainer-perf", icon: "📊", label: "Trainer Performance" },
    { id: "clients", icon: "👥", label: "Client Oversight", badge: atRiskClients.length, badgeColor: "red" },
    { id: "sessions", icon: "📝", label: "Session Logs", badge: pendingLogs, badgeColor: "yellow" },
    { id: "flags", icon: "🚨", label: "Flags & Alerts", badge: flaggedClients.length + lowAttendance.length, badgeColor: "red" },
    { id: "revenue", icon: "₹", label: "Revenue & Plans" },
    { id: "templates", icon: "🏋", label: "Workout Templates" },
    { id: "comms", icon: "📣", label: "Instructions Feed" },
    { id: "warnings", icon: "⚠", label: "Warnings Log" },
    { id: "audit", icon: "🔒", label: "Audit Trail" },
    { id: "reports", icon: "📋", label: "Weekly Report" },
    { id: "trainers-list", icon: "👤", label: "Trainers" },
  ];

  // ── Firestore actions ──
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
    if (pwForm.newPw.length < 6) { setPwMsg("Password must be at least 6 characters."); return; }
    setPwMsg(`✓ Password reset noted for ${pwTarget?.name}. Use Firebase Console → Authentication to change passwords.`);
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

  const filteredClients = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.trainerName?.toLowerCase().includes(clientSearch.toLowerCase());
    const matchTrainer = trainerFilter === "all" || c.trainerName === trainerFilter;
    const matchStatus = clientStatusFilter === "all" || (clientStatusFilter === "active" ? c.status !== "Inactive" : c.status === "Inactive");
    return matchSearch && matchTrainer && matchStatus;
  });

  const openEditClient = (c: Client) => {
    setEditForm({ ...c });
    setShowEditClient(true);
  };

  return (
    <div className="app">
      <style>{S}</style>

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showChangePw && (
        <div className="overlay" onClick={() => { setShowChangePw(false); setPwMsg(""); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Change Password — {pwTarget?.name}</div>
            <div className="fs12 t3 mb16">Use Firebase Console → Authentication to change passwords in production.</div>
            {pwMsg && <div className={`alert ${pwMsg.startsWith("✓") ? "al-g" : "al-r"} mb12`}>{pwMsg}</div>}
            <div className="field"><label>New Password</label><input className="fi" type="password" placeholder="Min 6 characters" value={pwForm.newPw} onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))} /></div>
            <div className="field"><label>Confirm Password</label><input className="fi" type="password" placeholder="Re-enter password" value={pwForm.confirmPw} onChange={(e) => setPwForm((p) => ({ ...p, confirmPw: e.target.value }))} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => { setShowChangePw(false); setPwMsg(""); }}>Cancel</button><button className="btn btn-p btn-s mla" onClick={changePassword}>Update Password</button></div>
          </div>
        </div>
      )}

      {/* ── EDIT CLIENT MODAL ── */}
      {showEditClient && editForm && (
        <div className="overlay" onClick={() => setShowEditClient(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Edit Client — {editForm.name}</div>
            <div className="g2">
              <div className="field"><label>Full Name</label><input className="fi" value={editForm.name || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
              <div className="field"><label>Email</label><input className="fi" type="email" value={editForm.email || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Gender</label>
                <select className="fi" value={editForm.gender || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Age</label><input className="fi" type="number" value={editForm.age || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, age: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Program Type</label>
                <select className="fi" value={editForm.programType || "1-on-1"} onChange={(e) => setEditForm((p: any) => ({ ...p, programType: e.target.value }))}>
                  <option>1-on-1</option><option>Couple</option><option>Online</option>
                </select>
              </div>
              <div className="field"><label>Status</label>
                <select className="fi" value={editForm.status || "Active"} onChange={(e) => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                  <option>Active</option><option>On Hold</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Plan Start Date</label><input className="fi" type="date" value={editForm.startDate || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="field"><label>Plan End Date</label><input className="fi" type="date" value={editForm.endDate || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Sessions Included</label><input className="fi" type="number" value={editForm.sessionsIncluded || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, sessionsIncluded: Number(e.target.value) }))} /></div>
              <div className="field"><label>Location</label><input className="fi" value={editForm.location || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, location: e.target.value }))} /></div>
            </div>
            <div className="field"><label>Medical Notes</label><textarea className="fi" rows={3} value={editForm.medicalNotes || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, medicalNotes: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowEditClient(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={saveEditClient}>Save Changes</button></div>
          </div>
        </div>
      )}

      {/* ── ADD TRAINER MODAL ── */}
      {showAddTrainer && (
        <div className="overlay" onClick={() => setShowAddTrainer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Add New Trainer</div>
            <div className="field"><label>Full Name</label><input className="fi" placeholder="e.g. Rahul Verma" value={newTrainer.name} onChange={(e) => setNewTrainer((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="field"><label>Email</label><input className="fi" type="email" placeholder="trainer@yourtrainer.in" value={newTrainer.email} onChange={(e) => setNewTrainer((p) => ({ ...p, email: e.target.value }))} /></div>
            <div className="field"><label>Speciality</label><input className="fi" placeholder="e.g. Weight Loss & HIIT" value={newTrainer.speciality} onChange={(e) => setNewTrainer((p) => ({ ...p, speciality: e.target.value }))} /></div>
            <div className="field"><label>Plan</label><select className="fi" value={newTrainer.plan} onChange={(e) => setNewTrainer((p) => ({ ...p, plan: e.target.value }))}><option>Starter</option><option>Pro</option></select></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowAddTrainer(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={addTrainer}>Add Trainer</button></div>
          </div>
        </div>
      )}

      {/* ── ADD CLIENT MODAL ── */}
      {showAddClient && (
        <div className="overlay" onClick={() => setShowAddClient(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Add New Client</div>
            <div className="g2">
              <div className="field"><label>Full Name *</label><input className="fi" placeholder="Client name" value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} /></div>
              <div className="field"><label>Email (optional)</label><input className="fi" type="email" placeholder="client@email.com" value={newClient.email} onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Gender</label>
                <select className="fi" value={newClient.gender} onChange={(e) => setNewClient((p) => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Age (optional)</label><input className="fi" type="number" placeholder="25" value={newClient.age} onChange={(e) => setNewClient((p) => ({ ...p, age: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Assign Trainer *</label>
                <select className="fi" value={newClient.trainerId} onChange={(e) => {
                  const t = trainers.find((tr) => tr.id === e.target.value);
                  setNewClient((p) => ({ ...p, trainerId: e.target.value, trainerName: t?.name || "" }));
                }}>
                  <option value="">Select trainer...</option>
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Program Type</label>
                <select className="fi" value={newClient.programType} onChange={(e) => setNewClient((p) => ({ ...p, programType: e.target.value }))}>
                  <option>1-on-1</option><option>Couple</option><option>Online</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Client Status</label>
                <select className="fi" value={newClient.status} onChange={(e) => setNewClient((p) => ({ ...p, status: e.target.value }))}>
                  <option>Active</option><option>On Hold</option><option>Inactive</option>
                </select>
              </div>
              <div className="field"><label>Plan Name</label><input className="fi" placeholder="e.g. 1 Month Plan" value={newClient.plan} onChange={(e) => setNewClient((p) => ({ ...p, plan: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Plan Start Date *</label><input className="fi" type="date" value={newClient.startDate} onChange={(e) => setNewClient((p) => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="field"><label>Plan End Date *</label><input className="fi" type="date" value={newClient.endDate} onChange={(e) => setNewClient((p) => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Sessions Included *</label><input className="fi" type="number" placeholder="12" value={newClient.sessionsIncluded} onChange={(e) => setNewClient((p) => ({ ...p, sessionsIncluded: e.target.value }))} /></div>
              <div className="field"><label>Location</label><input className="fi" placeholder="Online / Gym address" value={newClient.location} onChange={(e) => setNewClient((p) => ({ ...p, location: e.target.value }))} /></div>
            </div>
            <div className="field"><label>Medical Conditions / Notes</label><textarea className="fi" rows={3} placeholder="Injuries, medical conditions, medications..." value={newClient.medicalNotes} onChange={(e) => setNewClient((p) => ({ ...p, medicalNotes: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowAddClient(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={addClient}>Add Client</button></div>
          </div>
        </div>
      )}

      {/* ── POST INSTRUCTION MODAL ── */}
      {showInstruction && (
        <div className="overlay" onClick={() => setShowInstruction(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Post Instruction to Trainers</div>
            <div className="field"><label>Title</label><input className="fi" placeholder="e.g. Holiday Schedule Update" value={newInstruction.title} onChange={(e) => setNewInstruction((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="field"><label>Message</label><textarea className="fi" rows={4} placeholder="Full instruction details..." value={newInstruction.body} onChange={(e) => setNewInstruction((p) => ({ ...p, body: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="field"><label>Priority</label><select className="fi" value={newInstruction.priority} onChange={(e) => setNewInstruction((p) => ({ ...p, priority: e.target.value }))}><option value="medium">Medium</option><option value="high">High</option><option value="low">Low</option></select></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowInstruction(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={postInstruction}>Post Instruction</button></div>
          </div>
        </div>
      )}

      {/* ── ADD WARNING MODAL ── */}
      {showWarning && (
        <div className="overlay" onClick={() => setShowWarning(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Log Trainer Warning</div>
            <div className="field"><label>Trainer</label><select className="fi" value={newWarning.trainer} onChange={(e) => setNewWarning((p) => ({ ...p, trainer: e.target.value }))}><option value="">Select trainer...</option>{trainers.map((t) => <option key={t.id}>{t.name}</option>)}</select></div>
            <div className="field"><label>Warning Type</label><select className="fi" value={newWarning.type} onChange={(e) => setNewWarning((p) => ({ ...p, type: e.target.value }))}><option>Verbal Warning</option><option>Written Warning</option><option>Final Warning</option><option>Improvement Plan</option></select></div>
            <div className="field"><label>Private Note (Admin only)</label><textarea className="fi" rows={4} placeholder="Details of warning, expected improvement..." value={newWarning.note} onChange={(e) => setNewWarning((p) => ({ ...p, note: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="field"><label>Follow-up Date</label><input className="fi" type="date" value={newWarning.followUp} onChange={(e) => setNewWarning((p) => ({ ...p, followUp: e.target.value }))} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowWarning(false)}>Cancel</button><button className="btn btn-dn btn-s mla" onClick={addWarning}>Log Warning</button></div>
          </div>
        </div>
      )}

      {/* ── TRAINER DETAIL MODAL ── */}
      {selectedTrainer && !showChangePw && (
        <div className="overlay" onClick={() => setSelectedTrainer(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="row mb16">
              <div className="av av-t" style={{ width: 48, height: 48, fontSize: 16 }}>
                {selectedTrainer.avatar || (selectedTrainer.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedTrainer.name}</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>{selectedTrainer.speciality} · {selectedTrainer.email}</div>
                <span className={`badge fs10 mt4 ${selectedTrainer.status === "active" ? "bg" : "br"}`}>{selectedTrainer.status}</span>
              </div>
              <div className="mla"><ScoreRing score={selectedTrainer.accountabilityScore || 0} size={60} /></div>
              <button className="btn btn-g btn-xs" onClick={() => setSelectedTrainer(null)}>✕</button>
            </div>
            <div className="g4 mb16">
              {[
                { l: "Clients", v: clients.filter((c) => c.trainerId === selectedTrainer.id).length },
                { l: "Sessions Done/Assigned", v: `${selectedTrainer.sessions || 0}/${selectedTrainer.sessionsAssigned || 0}` },
                { l: "Missed Sessions", v: selectedTrainer.missedSessions || 0 },
                { l: "Pending Logs", v: selectedTrainer.pendingLogs || 0 },
              ].map((m, i) => (
                <div key={i} className="card-sm">
                  <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{m.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", marginTop: 4, color: i === 2 && Number(m.v) > 3 ? "var(--red)" : i === 3 && Number(m.v) > 0 ? "var(--yellow)" : "var(--t1)" }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div className="g2 mb16">
              <div>
                <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Their Clients</div>
                {clients.filter((c) => c.trainerId === selectedTrainer.id).map((c) => (
                  <div key={c.id} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--b1)", cursor: "pointer" }}
                    onClick={() => { setSelectedTrainer(null); setSelectedClient(c); }}>
                    <span className="fs13 fw6 t1">{c.name}</span>
                    <span className={`badge fs10 ml8 ${c.status === "Inactive" ? "bgr" : "bg"}`}>{c.status === "Inactive" ? "inactive" : "active"}</span>
                    <div className="pw" style={{ flex: 1, margin: "0 10px" }}><div className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${c.compliance || 0}%` }} /></div>
                    <span className="fs11 t3">{c.compliance || 0}%</span>
                    <span className={`badge fs10 mla ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span>
                  </div>
                ))}
                {clients.filter((c) => c.trainerId === selectedTrainer.id).length === 0 && <div className="fs12 t3">No clients assigned yet</div>}
              </div>
              <div>
                <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Accountability Breakdown</div>
                {[
                  { l: "Log Consistency", v: Math.max(0, 100 - (selectedTrainer.lateSubmissions || 0) * 8) },
                  { l: "Client Attendance", v: selectedTrainer.retention || 0 },
                  { l: "Progress Updates", v: Math.min(100, (selectedTrainer.progressUpdatesThisMonth || 0) * 5) },
                ].map((m, i) => (
                  <div key={i} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--b1)" }}>
                    <span className="fs12">{m.l}</span>
                    <div className="pw mla" style={{ width: 80 }}><div className={`pb ${m.v >= 85 ? "pb-g" : m.v >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${m.v}%` }} /></div>
                    <span className="fs11 fw7" style={{ marginLeft: 8 }}>{m.v}%</span>
                  </div>
                ))}
                {warnings.filter((w) => w.trainer === selectedTrainer.name).length > 0 && (
                  <div className="alert al-r mt8">⚠ {warnings.filter((w) => w.trainer === selectedTrainer.name).length} warning(s) on record</div>
                )}
              </div>
            </div>
            <div className="row gap8 flex-wrap">
              <button className={`btn btn-s ${selectedTrainer.status === "active" ? "btn-dn" : "btn-ok"}`}
                onClick={() => toggleTrainerStatus(selectedTrainer.id, selectedTrainer.status || "active")}>
                {selectedTrainer.status === "active" ? "Suspend" : "Activate"}
              </button>
              <button className="btn btn-warn btn-s" onClick={() => { setNewWarning((p) => ({ ...p, trainer: selectedTrainer.name })); setSelectedTrainer(null); setShowWarning(true); }}>Log Warning</button>
              <button className="btn btn-g btn-s" onClick={() => { setPwTarget(selectedTrainer); setSelectedTrainer(null); setShowChangePw(true); }}>🔑 Change Password</button>
              <button className="btn btn-g btn-s" onClick={() => { setTrainerFilter(selectedTrainer.name); setClientSearch(""); setClientStatusFilter("all"); setSelectedTrainer(null); setTab("clients"); }}>View All Clients</button>
              <button className="btn btn-p btn-s mla" onClick={() => { setNewClient((p) => ({ ...p, trainerName: selectedTrainer.name, trainerId: selectedTrainer.id })); setSelectedTrainer(null); setShowAddClient(true); }}>+ Add Client</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT DETAIL MODAL ── */}
      {selectedClient && !showEditClient && (
        <div className="overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="row mb16">
              <div className="av av-c" style={{ width: 48, height: 48, fontSize: 15 }}>
                {(selectedClient.name || "?").split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedClient.name}</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>Trainer: {selectedClient.trainerName}</div>
                <div className="row gap8 mt4">
                  <span className={`badge fs10 ${selectedClient.status === "Active" ? "bg" : selectedClient.status === "On Hold" ? "by" : "br"}`}>{selectedClient.status}</span>
                </div>
              </div>
              <button className="btn btn-g btn-xs mla" onClick={() => setSelectedClient(null)}>✕</button>
            </div>
            {selectedClient.medicalNotes && <div className="alert al-y mb12">🩹 Medical Notes: {selectedClient.medicalNotes}</div>}
            <div className="g4 mb16">
              {[
                { l: "Compliance", v: `${selectedClient.compliance || 0}%` },
                { l: "Sessions Done/Assigned", v: `${selectedClient.sessionsLogged || 0}/${selectedClient.sessionsIncluded || 0}` },
                { l: "Classes Left", v: selectedClient.classesLeft || 0 },
                { l: "Missed Sessions", v: selectedClient.missedSessions || 0 },
              ].map((m, i) => (
                <div key={i} className="card-sm">
                  <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{m.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", marginTop: 4, color: i === 0 && (selectedClient.compliance || 0) < 75 ? "var(--red)" : i === 3 && (selectedClient.missedSessions || 0) > 3 ? "var(--red)" : "var(--t1)" }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div className="g2 mb16">
              <div>
                <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Plan Consumption</div>
                <div className="row gap8 mb8"><span className="fs12 t2">Sessions used</span><span className="fs12 fw7 mla">{selectedClient.sessionsLogged || 0} / {selectedClient.sessionsIncluded || 0}</span></div>
                <div className="pw" style={{ height: 8 }}>
                  <div className={`pb ${(selectedClient.classesLeft || 0) > 5 ? "pb-g" : (selectedClient.classesLeft || 0) > 2 ? "pb-y" : "pb-r"}`}
                    style={{ height: "100%", width: `${(selectedClient.sessionsIncluded || 0) > 0 ? ((selectedClient.sessionsLogged || 0) / selectedClient.sessionsIncluded) * 100 : 0}%`, borderRadius: 4 }} />
                </div>
                <div className="row gap8 mt8 mb4">
                  <span className="fs11 t3">Start: {selectedClient.startDate || "—"}</span>
                  <span className="fs11 t3 mla">End: {selectedClient.endDate || "—"}</span>
                </div>
                <div className="row">
                  <span className={`fs12 fw7 ${(selectedClient.classesLeft || 0) <= 2 ? "tr" : (selectedClient.classesLeft || 0) <= 5 ? "ty" : "tg"}`}>{selectedClient.classesLeft || 0} classes left</span>
                  <span className="fs11 t3 mla">{selectedClient.plan || "—"}</span>
                </div>
                <div className="fs10 t3 mt12" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Progress Last Updated</div>
                <div className={`row mt4 ${selectedClient.progressLastUpdated === "Never" ? "tr" : "tg"}`}>
                  <span className="fs13 fw7">{selectedClient.progressLastUpdated || "Never"}</span>
                  {selectedClient.progressLastUpdated === "Never" && <span className="overdue-tag mla">OVERDUE</span>}
                </div>
              </div>
              <div>
                {selectedClient.medicalNotes && (
                  <div className="card-sm mb8">
                    <div className="fs10 t3 mb4" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Medical Notes</div>
                    <div className="fs12 t2">{selectedClient.medicalNotes}</div>
                  </div>
                )}
                <div className="card-sm">
                  <div className="fs10 t3 mb4" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Program Info</div>
                  <div className="row"><span className="fs12 t2">Type</span><span className="fs12 fw7 mla">{selectedClient.programType || "—"}</span></div>
                  <div className="row mt4"><span className="fs12 t2">Location</span><span className="fs12 mla t1">{selectedClient.location || "—"}</span></div>
                </div>
              </div>
            </div>
            <div className="row gap8">
              <button className={`btn btn-s ${selectedClient.status === "Inactive" ? "btn-ok" : "btn-dn"}`}
                onClick={() => toggleClientStatus(selectedClient.id, selectedClient.trainerId, selectedClient.status)}>
                {selectedClient.status === "Inactive" ? "Activate Client" : "Deactivate Client"}
              </button>
              <button className="btn btn-warn btn-s" onClick={() => openEditClient(selectedClient)}>Edit Client</button>
              <button className="btn btn-g btn-s" onClick={() => { setTab("clients"); setSelectedClient(null); }}>View in Table</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div className="sb">
        <div className="sb-logo">
          <div className="logo-yt">Your<span>Trainer</span></div>
          <div className="logo-tag">Admin Control Panel</div>
          <div className="rp rp-a">⚡ Super Admin</div>
        </div>
        <div className="sb-nav">
          {navItems.map((item) => (
            <div key={item.id} className={`ni ${tab === item.id ? "on" : ""}`} onClick={() => setTab(item.id)}>
              <span className="ni-ic">{item.icon}</span>
              <span>{item.label}</span>
              {(item as any).badge > 0 ? <span className={`ni-b ${(item as any).badgeColor || ""}`}>{(item as any).badge}</span> : null}
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div className="uc"><div className="av av-a">SA</div><div><div className="uc-n">{name}</div><div className="uc-r">Super Admin</div></div></div>
          <button className="btn-so" onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main">
        <div className="topbar">
          <div className="tb-t">{navItems.find((n) => n.id === tab)?.label || "Dashboard"}</div>
          {tab === "trainers-list" && <button className="btn btn-p btn-s" onClick={() => setShowAddTrainer(true)}>+ Add Trainer</button>}
          {tab === "clients" && <button className="btn btn-p btn-s" onClick={() => setShowAddClient(true)}>+ Add Client</button>}
          {tab === "comms" && <button className="btn btn-p btn-s" onClick={() => setShowInstruction(true)}>+ Post Instruction</button>}
          {tab === "warnings" && <button className="btn btn-dn btn-s" onClick={() => setShowWarning(true)}>+ Log Warning</button>}
        </div>
        <div className="content">

          {/* ── CONTROL ROOM ── */}
          {tab === "overview" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Control Room</h2><p>Live platform overview</p></div></div>
              <div className="g4">
                {[
                  { l: "Total Revenue (Feb)", v: `₹${(totalRevenue / 1000).toFixed(0)}K`, s: "All trainers combined", d: "+14.2%", up: true, c: "var(--brand)" },
                  { l: "Active Clients", v: clients.filter((c) => c.status !== "Inactive").length, s: `${clients.filter((c) => c.status === "Active").length} paid active`, d: "+4 this month", up: true, c: "var(--blue)" },
                  { l: "Pending Session Logs", v: pendingLogs, s: "Must be logged today", d: pendingLogs > 0 ? "Action needed" : "All clear", up: pendingLogs === 0, c: pendingLogs > 0 ? "var(--red)" : "var(--green)" },
                  { l: "Avg Accountability", v: `${avgAccountability}%`, s: "Across all trainers", d: "+2% vs last month", up: true, c: "var(--purple)" },
                ].map((s, i) => (
                  <div key={i} className="sc" style={{ cursor: i === 1 ? "pointer" : "default" }} onClick={i === 1 ? () => setTab("clients") : undefined}>
                    <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
                    <div className="sl">{s.l}</div>
                    <div className="sv" style={{ color: s.c }}>{s.v}</div>
                    <div className="ss">{s.s}</div>
                    <div className={`sd ${s.up ? "sup" : "sdn"}`}>{s.up ? "▲" : "▼"} {s.d}</div>
                  </div>
                ))}
              </div>
              <div className="g2">
                <div className="card">
                  <div className="ch"><span className="ct">Today's Sessions</span><span className="badge bb">{todaySessions.length} total</span></div>
                  {todaySessions.length === 0 && <div className="fs12 t3">No sessions logged today yet.</div>}
                  {todaySessions.map((s) => (
                    <div key={s.id} className="ai">
                      <div className="ad" style={{ background: s.status === "completed" ? "var(--green)" : s.status === "missed" ? "var(--red)" : "var(--yellow)" }} />
                      <div style={{ flex: 1 }}>
                        <div className="row gap8">
                          <span className="fw6 fs13 t1" style={{ cursor: "pointer" }} onClick={() => { const c = clients.find((cl) => cl.name === s.client); if (c) setSelectedClient(c); }}>{s.client}</span>
                          <span className="fs10 t3">→ {s.trainer}</span>
                          <span className={`badge fs10 mla ${s.status === "completed" ? "bg" : s.status === "missed" ? "br" : "by"}`}>{s.status}</span>
                        </div>
                        <div className="fs11 t3 mt4">{s.type} · {s.date} {s.late && <span className="overdue-tag" style={{ marginLeft: 4 }}>LATE LOG</span>}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">Urgent Alerts</span><span className="badge br">{atRiskClients.length + pendingLogs} items</span></div>
                  <div className="col gap8">
                    {pendingLogs > 0 && <div className="alert al-r" style={{ cursor: "pointer" }} onClick={() => setTab("sessions")}>📝 {pendingLogs} session logs pending</div>}
                    {expiredClients.map((c) => <div key={c.id} className="alert al-r" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>📅 {c.name} — plan expired {c.endDate}</div>)}
                    {lowClassClients.map((c) => <div key={c.id} className="alert al-y" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>⚠ {c.name} — {c.classesLeft} class{c.classesLeft === 1 ? "" : "es"} left</div>)}
                    {clients.filter((c) => (c.compliance || 0) < 70).map((c) => <div key={c.id} className="alert al-y" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>📉 {c.name} — {c.compliance || 0}% attendance</div>)}
                  </div>
                </div>
              </div>
              <div className="g32">
                <div className="card">
                  <div className="ch"><span className="ct">Revenue Trend</span><span className="badge bg">₹{(totalRevenue / 1000).toFixed(0)}K MTD</span></div>
                  <BarChart data={revData} color="var(--brand)" />
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">Platform Health</span></div>
                  <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 0" }}>
                    <Donut value={trainers.length ? Math.round(trainers.reduce((s, t) => s + (t.retention || 0), 0) / trainers.length) : 0} color="var(--green)" label="Retention" />
                    <Donut value={avgAccountability} color="var(--brand)" label="Accountability" />
                    <Donut value={clients.length ? Math.round(clients.reduce((s, c) => s + (c.compliance || 0), 0) / clients.length) : 0} color="var(--blue)" label="Compliance" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TRAINER PERFORMANCE ── */}
          {tab === "trainer-perf" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Trainer Performance</h2><p>Click any row to open trainer profile</p></div></div>
              <div className="card" style={{ padding: 0 }}>
                <div className="tw">
                  <table>
                    <thead><tr><th>Trainer</th><th>Score</th><th>Sessions</th><th>Missed</th><th>Pending Logs</th><th>Avg Compliance</th><th>Progress Updates</th><th>Late Logs</th><th>Warnings</th><th>Action</th></tr></thead>
                    <tbody>
                      {trainers.map((t) => {
                        const tClients = clients.filter((c) => c.trainerId === t.id);
                        const avgComp = tClients.length ? Math.round(tClients.reduce((s, c) => s + (c.compliance || 0), 0) / tClients.length) : 0;
                        return (
                          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setSelectedTrainer(t)}>
                            <td>
                              <div className="row gap8">
                                <div className="av av-t" style={{ width: 28, height: 28, fontSize: 10 }}>{t.avatar}</div>
                                <div><div className="t1 fw6 fs13">{t.name}</div><div className="fs10 t3">{t.speciality}</div></div>
                                {t.status === "suspended" && <span className="badge br fs10">suspended</span>}
                              </div>
                            </td>
                            <td><ScoreRing score={t.accountabilityScore || 0} size={44} /></td>
                            <td><span className={`fw7 ${(t.sessions || 0) < (t.sessionsAssigned || 0) * 0.9 ? "tr" : "tg"}`}>{t.sessions || 0}/{t.sessionsAssigned || 0}</span></td>
                            <td><span className={(t.missedSessions || 0) > 3 ? "tr fw7" : "t2"}>{t.missedSessions || 0}</span></td>
                            <td><span className={(t.pendingLogs || 0) > 0 ? "ty fw7" : "tg"}>{(t.pendingLogs || 0) === 0 ? "✓ Clear" : `${t.pendingLogs} pending`}</span></td>
                            <td>
                              <div className="row gap8">
                                <div className="pw" style={{ width: 50 }}><div className={`pb ${avgComp >= 85 ? "pb-g" : avgComp >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${avgComp}%` }} /></div>
                                <span className="fs11 fw7">{avgComp}%</span>
                              </div>
                            </td>
                            <td><span className={(t.progressUpdatesThisMonth || 0) < 10 ? "ty" : "tg"}>{t.progressUpdatesThisMonth || 0}</span></td>
                            <td><span className={(t.lateSubmissions || 0) > 2 ? "tr fw7" : (t.lateSubmissions || 0) > 0 ? "ty" : "tg"}>{(t.lateSubmissions || 0) === 0 ? "✓ None" : t.lateSubmissions}</span></td>
                            <td><span className={(t.warnings || 0) > 0 ? "tr fw7" : "tg"}>{(t.warnings || 0) === 0 ? "✓ Clean" : `${t.warnings} ⚠`}</span></td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="row gap4">
                                <button className="btn btn-warn btn-xs" onClick={() => { setNewWarning((p) => ({ ...p, trainer: t.name })); setShowWarning(true); }}>Warn</button>
                                <button className="btn btn-g btn-xs" onClick={() => { setPwTarget(t); setShowChangePw(true); }}>🔑</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="ch"><span className="ct">Client Drop-off Risk by Trainer</span></div>
                <div className="g3">
                  {trainers.map((t) => {
                    const mine = clients.filter((c) => c.trainerId === t.id);
                    const atRisk = mine.filter((c) => (c.missedSessions || 0) > 3 || (c.compliance || 0) < 70);
                    return (
                      <div key={t.id} className="card-sm">
                        <div className="row mb8">
                          <div className="av av-t" style={{ width: 26, height: 26, fontSize: 10 }}>{t.avatar}</div>
                          <span className="fw7 fs13" style={{ marginLeft: 8, cursor: "pointer" }} onClick={() => setSelectedTrainer(t)}>{t.name}</span>
                          <span className={`badge fs10 mla ${atRisk.length > 0 ? "br" : "bg"}`}>{atRisk.length > 0 ? `${atRisk.length} at risk` : "All good"}</span>
                        </div>
                        {atRisk.map((c) => (
                          <div key={c.id} className="fs11 t3 mt4" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>• {c.name} — {c.compliance || 0}% · {c.missedSessions || 0} missed</div>
                        ))}
                        {atRisk.length === 0 && <div className="fs11 tg">No drop-off risks</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── CLIENT OVERSIGHT ── */}
          {tab === "clients" && (
            <>
              <div className="sh">
                <div className="sh-l"><h2>Client Oversight</h2><p>{filteredClients.length} of {clients.length} clients</p></div>
                <div className="row gap8">
                  <input className="fi" style={{ width: 180 }} placeholder="Search name or trainer..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                  <select className="fi" style={{ width: 120 }} value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
                    <option value="all">All Trainers</option>
                    {trainers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                  <select className="fi" style={{ width: 110 }} value={clientStatusFilter} onChange={(e) => setClientStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="btn btn-p btn-s" onClick={() => setShowAddClient(true)}>+ Add Client</button>
                </div>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <div className="tw">
                  <table>
                    <thead><tr><th>Client</th><th>Status</th><th>Trainer</th><th>Attendance</th><th>Missed</th><th>Sessions Left</th><th>Progress</th><th>Plan</th><th>Expires</th><th>Risk</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredClients.map((c) => (
                        <tr key={c.id} style={{ cursor: "pointer", opacity: c.status === "Inactive" ? 0.6 : 1 }} onClick={() => setSelectedClient(c)}>
                          <td><div className="col gap4"><span className="t1 fw6 fs13">{c.name}</span><span className="fs10 t3">{c.programType}</span></div></td>
                          <td><span className={`badge fs10 ${c.status === "Inactive" ? "bgr" : "bg"}`}>{c.status === "Inactive" ? "inactive" : "active"}</span></td>
                          <td className="fs12">{c.trainerName}</td>
                          <td>
                            <div className="row gap8">
                              <div className="pw" style={{ width: 44 }}><div className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${c.compliance || 0}%` }} /></div>
                              <span className={`fs11 fw7 ${(c.compliance || 0) < 70 ? "tr" : (c.compliance || 0) < 85 ? "ty" : "tg"}`}>{c.compliance || 0}%</span>
                            </div>
                          </td>
                          <td><span className={(c.missedSessions || 0) > 3 ? "tr fw7" : "t2"}>{c.missedSessions || 0}</span></td>
                          <td><span className={(c.classesLeft || 0) <= 2 ? "tr fw7" : (c.classesLeft || 0) <= 5 ? "ty fw7" : "tg"}>{c.classesLeft || 0}</span></td>
                          <td><span className={c.progressLastUpdated === "Never" ? "tr fs11" : "tg fs11"}>{c.progressLastUpdated || "Never"}{c.progressLastUpdated === "Never" && <span className="overdue-tag" style={{ marginLeft: 4 }}>OVERDUE</span>}</span></td>
                          <td><span className={`badge ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span></td>
                          <td className="fs11 t3">{c.endDate || "—"}</td>
                          <td>{c.medicalNotes ? <span className="badge by">🩹</span> : <span className="tg fs11">✓</span>}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="row gap4">
                              <button className="btn btn-g btn-xs" onClick={() => setSelectedClient(c)}>View</button>
                              <button className="btn btn-warn btn-xs" onClick={() => openEditClient(c)}>Edit</button>
                              <button className={`btn btn-xs ${c.status === "Inactive" ? "btn-ok" : "btn-dn"}`} onClick={() => toggleClientStatus(c.id, c.trainerId, c.status)}>
                                {c.status === "Inactive" ? "On" : "Off"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── SESSION LOGS ── */}
          {tab === "sessions" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Session Logs</h2><p>All trainer submissions — late logs flagged</p></div></div>
              {pendingLogs > 0 && <div className="alert al-r">🚨 {pendingLogs} session logs NOT submitted.</div>}
              <div className="card" style={{ padding: 0 }}>
                <div className="tw">
                  <table>
                    <thead><tr><th>Client</th><th>Trainer</th><th>Date</th><th>Type</th><th>Status</th><th>Duration</th><th>Logged</th><th>Late?</th><th>Notes</th></tr></thead>
                    <tbody>
                      {sessionLogs.map((s) => (
                        <tr key={s.id}>
                          <td className="t1 fw6" style={{ cursor: "pointer" }} onClick={() => { const c = clients.find((cl) => cl.name === s.client); if (c) setSelectedClient(c); }}>{s.client}</td>
                          <td className="fs12" style={{ cursor: "pointer" }} onClick={() => { const t = trainers.find((tr) => tr.name === s.trainer); if (t) setSelectedTrainer(t); }}>{s.trainer}</td>
                          <td className="fs11 t3">{s.date}</td>
                          <td><span className="badge bgr fs10">{s.type}</span></td>
                          <td><span className={`badge fs10 ${s.status === "completed" ? "bg" : s.status === "missed" ? "br" : s.status === "cancelled" ? "by" : "bb"}`}>{s.status}</span></td>
                          <td className="fs12">{s.duration > 0 ? `${s.duration} min` : "—"}</td>
                          <td className="fs11 t3">{s.loggedAt}</td>
                          <td>{s.late ? <span className="overdue-tag">LATE</span> : <span className="tg fs11">✓</span>}</td>
                          <td className="fs11 t2" style={{ maxWidth: 180 }}>{s.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── FLAGS & ALERTS ── */}
          {tab === "flags" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Flags & Alerts</h2><p>Click any item to open profile</p></div></div>
              <div className="g2">
                <div className="card">
                  <div className="ch"><span className="ct">🚨 Risk Flags</span><span className="badge br">{flaggedClients.length}</span></div>
                  <div className="col gap8">
                    {flaggedClients.map((c) => (
                      <div key={c.id} className="flag-card" style={{ borderColor: "var(--yellow)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                        <div className="row"><span className="fw6 fs13 t1">{c.name}</span><span className="fs11 t3 mla">{c.trainerName}</span></div>
                        <div className="fs11 t3 mt4">{c.medicalNotes}</div>
                      </div>
                    ))}
                    {flaggedClients.length === 0 && <div className="fs12 tg">No active risk flags</div>}
                  </div>
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">📉 Low Attendance</span><span className="badge by">{lowAttendance.length}</span></div>
                  <div className="col gap8">
                    {lowAttendance.map((c) => (
                      <div key={c.id} className="flag-card" style={{ borderColor: "var(--yellow)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                        <div className="row"><span className="fw6 fs13 t1">{c.name}</span><span className="badge by fs10 mla">{c.compliance || 0}%</span></div>
                        <div className="fs11 t3 mt4">{c.trainerName} · {c.missedSessions || 0} missed</div>
                      </div>
                    ))}
                    {lowAttendance.length === 0 && <div className="fs12 tg">All clients above 70%</div>}
                  </div>
                </div>
              </div>
              <div className="g2">
                <div className="card">
                  <div className="ch"><span className="ct">⏰ Late Log Submissions</span></div>
                  <div className="col gap8">
                    {sessionLogs.filter((s) => s.late).map((s) => (
                      <div key={s.id} className="flag-card" style={{ borderColor: "var(--yellow)", cursor: "pointer" }} onClick={() => { const t = trainers.find((tr) => tr.name === s.trainer); if (t) setSelectedTrainer(t); }}>
                        <div className="row"><span className="fw6 fs13 t1">{s.trainer}</span><span className="overdue-tag mla">LATE</span></div>
                        <div className="fs11 t3 mt4">Session with {s.client} on {s.date}</div>
                      </div>
                    ))}
                    {sessionLogs.filter((s) => s.late).length === 0 && <div className="fs12 tg">No late submissions</div>}
                  </div>
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">📅 Expiring Plans</span></div>
                  <div className="col gap8">
                    {expiredClients.map((c) => (
                      <div key={c.id} className="flag-card" style={{ borderColor: "var(--red)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                        <div className="row"><span className="fw6 fs13 t1">{c.name}</span><span className="overdue-tag mla">EXPIRED</span></div>
                        <div className="fs11 t3 mt4">Ended: {c.endDate} · {c.classesLeft || 0} sessions left</div>
                      </div>
                    ))}
                    {expiredClients.length === 0 && <div className="fs12 tg">No expired plans</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── REVENUE & PLANS ── */}
          {tab === "revenue" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Revenue & Plan Tracker</h2><p>Sessions sold vs delivered · Renewal risk</p></div></div>
              <div className="g4">
                {[
                  { l: "Sessions Sold (Feb)", v: clients.reduce((s, c) => s + (c.sessionsIncluded || 0), 0), c: "var(--brand)" },
                  { l: "Sessions Delivered", v: clients.reduce((s, c) => s + (c.sessionsLogged || 0), 0), c: "var(--green)" },
                  { l: "Renewal Risk", v: clients.filter((c) => (c.classesLeft || 0) <= 3 || c.status === "On Hold" || (c.compliance || 0) < 70).length, c: "var(--red)" },
                  { l: "Inactive Clients", v: clients.filter((c) => c.status === "Inactive").length, c: "var(--yellow)" },
                ].map((s, i) => (
                  <div key={i} className="sc">
                    <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
                    <div className="sl">{s.l}</div>
                    <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="g2">
                <div className="card">
                  <div className="ch"><span className="ct">Plan Consumption</span></div>
                  {clients.map((c) => (
                    <div key={c.id} className="row" style={{ padding: "10px 0", borderBottom: "1px solid var(--b1)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                      <div style={{ minWidth: 120 }}><div className="fw6 fs13 t1">{c.name}</div><div className="fs10 t3">{c.trainerName}</div></div>
                      <div style={{ flex: 1, margin: "0 12px" }}>
                        <div className="pw" style={{ height: 6 }}><div className={`pb ${(c.classesLeft || 0) <= 2 ? "pb-r" : (c.classesLeft || 0) <= 5 ? "pb-y" : "pb-g"}`} style={{ height: "100%", width: `${(c.sessionsIncluded || 0) > 0 ? ((c.sessionsLogged || 0) / c.sessionsIncluded) * 100 : 0}%`, borderRadius: 4 }} /></div>
                        <div className="row mt4"><span className="fs10 t3">{c.sessionsLogged || 0} used</span><span className="fs10 t3 mla">{c.classesLeft || 0} left</span></div>
                      </div>
                      <span className={`badge fs10 ${(c.classesLeft || 0) <= 2 ? "br" : (c.classesLeft || 0) <= 5 ? "by" : "bg"}`}>{c.classesLeft || 0}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">🔄 Renewal Risk</span><span className="badge br">{clients.filter((c) => (c.classesLeft || 0) <= 3 || c.status === "On Hold" || (c.compliance || 0) < 70).length}</span></div>
                  <div className="col gap8">
                    {clients.filter((c) => (c.classesLeft || 0) <= 3 || c.status === "On Hold" || (c.compliance || 0) < 70).map((c) => (
                      <div key={c.id} className="card-sm" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                        <div className="row"><span className="fw7 fs13 t1">{c.name}</span><span className={`badge fs10 mla ${c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span></div>
                        <div className="col gap4 mt4">
                          {(c.classesLeft || 0) <= 3 && <span className="fs11 tr">• {c.classesLeft || 0} sessions left</span>}
                          {(c.compliance || 0) < 70 && <span className="fs11 ty">• Attendance: {c.compliance || 0}%</span>}
                          {c.status === "On Hold" && <span className="fs11 ty">• Expires: {c.endDate}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── WORKOUT TEMPLATES ── */}
          {tab === "templates" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Workout Templates</h2><p>Admin-approved — trainers choose from these</p></div>
                <button className="btn btn-p btn-s">+ Create Template</button>
              </div>
              <div className="col gap12">
                {APPROVED_TEMPLATES.map((t) => (
                  <div key={t.id} className="card">
                    <div className="row">
                      <div style={{ flex: 1 }}>
                        <div className="row gap12 mb8">
                          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                          <span className={`badge fs10 ${t.category === "Fat Loss" ? "by" : t.category === "Strength" ? "bo" : t.category === "Rehab" ? "bb" : t.category === "Performance" ? "bp" : "bg"}`}>{t.category}</span>
                          <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                        </div>
                        <div className="fs12 t2 mb8">{t.description}</div>
                        <div className="row gap16"><span className="fs11 t3">📅 {t.days}</span><span className="fs11 t3">⏱ {t.duration}</span><span className="fs11 t3">🏋 {t.exercises} exercises</span></div>
                      </div>
                      <div className="row gap8">
                        <button className="btn btn-g btn-s">Edit</button>
                        <button className="btn btn-g btn-s">View</button>
                        <button className="btn btn-dn btn-xs">Deactivate</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── INSTRUCTIONS FEED ── */}
          {tab === "comms" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Instructions Feed</h2><p>Trainers see this — they can't say "I didn't know"</p></div>
                <button className="btn btn-p btn-s" onClick={() => setShowInstruction(true)}>+ Post Instruction</button>
              </div>
              <div className="col gap12">
                {instructions.map((ins) => (
                  <div key={ins.id} className="card" style={{ borderLeft: `3px solid ${ins.priority === "high" ? "var(--red)" : ins.priority === "medium" ? "var(--yellow)" : "var(--blue)"}` }}>
                    <div className="row mb8">
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{ins.title}</span>
                      <span className={`badge fs10 mla ${ins.priority === "high" ? "br" : ins.priority === "medium" ? "by" : "bb"}`}>{ins.priority}</span>
                      <span className="fs11 t3" style={{ marginLeft: 10 }}>{ins.date} · {ins.by}</span>
                    </div>
                    <div className="fs13 t2">{ins.body}</div>
                    <div className="row mt12 gap8">
                      <button className="btn btn-dn btn-xs" onClick={() => deleteInstruction(ins.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                {instructions.length === 0 && <div className="alert al-b">No instructions posted yet.</div>}
              </div>
            </>
          )}

          {/* ── WARNINGS LOG ── */}
          {tab === "warnings" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Trainer Warnings Log</h2><p>Private admin-only record</p></div>
                <button className="btn btn-dn btn-s" onClick={() => setShowWarning(true)}>+ Log Warning</button>
              </div>
              {warnings.length === 0 && <div className="alert al-g">✓ No warnings on record.</div>}
              <div className="col gap12">
                {warnings.map((w, i) => (
                  <div key={i} className="card" style={{ borderLeft: "3px solid var(--red)", cursor: "pointer" }} onClick={() => { const t = trainers.find((tr) => tr.name === w.trainer); if (t) setSelectedTrainer(t); }}>
                    <div className="row mb8">
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{w.trainer}</span>
                      <span className="badge br fs10">{w.type}</span>
                      <span className="fs11 t3 mla">{w.date} · by {w.by}</span>
                    </div>
                    <div className="fs13 t2 mb8">{w.note}</div>
                    {w.followUp && <div className="fs11 t3">Follow-up: <span className="ty fw7">{w.followUp}</span></div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── AUDIT TRAIL ── */}
          {tab === "audit" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Audit Trail</h2><p>Every change logged</p></div><button className="btn btn-g btn-s">Export CSV</button></div>
              <div className="card">
                {[
                  { actor: "Gokul", action: "Logged session for", target: "Rajesh Kumar", detail: "Strength Training · 65 min", time: "Feb 27, 10:12am", type: "log" },
                  { actor: "Sreekanta", action: "Updated progress for", target: "Ananya Iyer", detail: "Weight: 71kg → updated", time: "Feb 27, 9:44am", type: "update" },
                  { actor: "Admin", action: "Posted instruction:", target: "Holi Holiday Mar 14", detail: "Priority: High", time: "Feb 28, 9:00am", type: "admin" },
                  { actor: "Aman", action: "Logged session for", target: "Deepika Singh", detail: "Modified — reduced intensity", time: "Feb 26, 6:15pm", type: "modified" },
                  { actor: "Admin", action: "Logged warning for", target: "Aman", detail: "Late log submissions", time: "Feb 10, 3:00pm", type: "warning" },
                ].map((log, i) => (
                  <div key={i} className="ai">
                    <div className="ad" style={{ background: log.type === "warning" ? "var(--red)" : log.type === "admin" ? "var(--brand)" : log.type === "modified" ? "var(--purple)" : "var(--green)" }} />
                    <div style={{ flex: 1 }}>
                      <div className="row gap8">
                        <span className="fw6 fs13 t1">{log.actor}</span>
                        <span className="fs12 t3">{log.action}</span>
                        <span className="fs12 to fw6">{log.target}</span>
                      </div>
                      <div className="fs11 t3 mt4">{log.detail}</div>
                    </div>
                    <span className="fs10 t3" style={{ whiteSpace: "nowrap" }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── WEEKLY REPORT ── */}
          {tab === "reports" && (
            <>
              <div className="sh">
                <div className="sh-l"><h2>Weekly Review Report</h2><p>Auto-generated — your 10 minute review</p></div>
                <div className="row gap8"><button className="btn btn-g btn-s">Export PDF</button><button className="btn btn-p btn-s">Email to Self</button></div>
              </div>
              <div className="g3">
                {[
                  { l: "Sessions This Week", v: sessionLogs.length, sub: `${sessionLogs.filter((s) => s.status === "completed").length} completed`, c: "var(--blue)" },
                  { l: "On-Time Logs", v: `${sessionLogs.filter((s) => !s.late).length}/${sessionLogs.length}`, sub: `${sessionLogs.filter((s) => s.late).length} late`, c: "var(--green)" },
                  { l: "At-Risk Clients", v: atRiskClients.length, sub: "Low compliance or expiring", c: "var(--red)" },
                ].map((s, i) => (
                  <div key={i} className="sc">
                    <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
                    <div className="sl">{s.l}</div>
                    <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
                    <div className="ss">{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="g2">
                <div className="card">
                  <div className="ch"><span className="ct">Trainer Summary</span></div>
                  {trainers.map((t) => (
                    <div key={t.id} className="row" style={{ padding: "10px 0", borderBottom: "1px solid var(--b1)", cursor: "pointer" }} onClick={() => setSelectedTrainer(t)}>
                      <div className="av av-t" style={{ width: 28, height: 28, fontSize: 10 }}>{t.avatar}</div>
                      <div style={{ flex: 1, marginLeft: 8 }}>
                        <div className="fw6 fs13 t1">{t.name}</div>
                        <div className="fs11 t3">Sessions: {t.sessions || 0}/{t.sessionsAssigned || 0} · Missed: {t.missedSessions || 0}</div>
                      </div>
                      <ScoreRing score={t.accountabilityScore || 0} size={40} />
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">Exception Report</span></div>
                  <div className="col gap8">
                    {expiredClients.map((c) => <div key={c.id} className="alert al-r">📅 {c.name}: plan expired {c.endDate}</div>)}
                    {lowClassClients.map((c) => <div key={c.id} className="alert al-y">⚠ {c.name}: {c.classesLeft} sessions left</div>)}
                    {sessionLogs.filter((s) => s.late).length > 0 && <div className="alert al-y">⏰ {sessionLogs.filter((s) => s.late).length} late session log(s) this period</div>}
                    {expiredClients.length === 0 && lowClassClients.length === 0 && sessionLogs.filter((s) => s.late).length === 0 && <div className="alert al-g">✓ No exceptions this period</div>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TRAINERS LIST ── */}
          {tab === "trainers-list" && (
            <>
              <div className="sh">
                <div className="sh-l"><h2>Trainers</h2><p>{trainers.length} trainers — click any to manage</p></div>
                <button className="btn btn-p btn-s" onClick={() => setShowAddTrainer(true)}>+ Add Trainer</button>
              </div>
              <div className="g3">
                {trainers.map((t) => (
                  <div key={t.id} className="cc" style={{ opacity: t.status === "suspended" ? 0.6 : 1 }} onClick={() => setSelectedTrainer(t)}>
                    <div className="row mb12">
                      <div className="av av-t" style={{ width: 40, height: 40 }}>{t.avatar}</div>
                      <div style={{ marginLeft: 10 }}>
                        <div className="fw7 fs14 t1">{t.name}</div>
                        <div className="fs11 t3">{t.speciality}</div>
                      </div>
                      <div className="mla"><ScoreRing score={t.accountabilityScore || 0} size={44} /></div>
                    </div>
                    <div className="row mb12 gap8">
                      <span className={`badge fs10 ${t.status === "active" ? "bg" : "br"}`}>{t.status}</span>
                      <span className={`badge fs10 ${t.plan === "Pro" ? "bo" : "bgr"}`}>{t.plan}</span>
                      {(t.warnings || 0) > 0 && <span className="badge br fs10">⚠ {t.warnings}</span>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                      {[
                        { v: clients.filter((c) => c.trainerId === t.id).length, k: "Clients" },
                        { v: `${t.retention || 0}%`, k: "Retention" },
                        { v: `₹${((t.revenue || 0) / 1000).toFixed(0)}K`, k: "Revenue" },
                      ].map((s, i) => (
                        <div key={i} style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: "8px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, color: i === 2 ? "var(--green)" : "var(--t1)" }}>{s.v}</div>
                          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{s.k}</div>
                        </div>
                      ))}
                    </div>
                    <div className="row gap8 mt12" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-g btn-xs" onClick={() => { setNewClient((p) => ({ ...p, trainerId: t.id, trainerName: t.name })); setShowAddClient(true); }}>+ Client</button>
                      <button className="btn btn-g btn-xs" onClick={() => { setPwTarget(t); setShowChangePw(true); }}>🔑 Password</button>
                      <button className={`btn btn-xs mla ${t.status === "active" ? "btn-dn" : "btn-ok"}`} onClick={() => toggleTrainerStatus(t.id, t.status || "active")}>
                        {t.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ============================================================
// TRAINER DASHBOARD
// (Will be moved to app/trainer/ in Part 3)
// ============================================================
function Trainer({
  uid,
  name,
  email,
  logout,
  clients,
  trainers,
  instructions,
}: {
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
    WORKOUT_LIBRARY["Chest"].slice(0, 3).map((e) => ({ ...e, sets: "3", reps: "10", weight: "0" }))
  );
  const [logClient, setLogClient] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [injuryFlag, setInjuryFlag] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
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
  const [dietSaved, setDietSaved] = useState(false);
  const [newProgress, setNewProgress] = useState({ weight: "", bf: "", chest: "", waist: "", hips: "", arms: "", thighs: "", squat: "", bench: "", deadlift: "", pullup: "", notes: "" });
  const [newDiet, setNewDiet] = useState({ protein: "", water: "", steps: "", sleep: "", sleepQuality: "Good", notes: "" });
  const [progressHistory, setProgressHistory] = useState<Record<string, any[]>>({});
  const [dietHistory, setDietHistory] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!uid) return;
    const unsubProgress = onSnapshot(
      query(collection(db, "progressLogs"), orderBy("createdAt", "asc")),
      (snap) => {
        const grouped: Record<string, any[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.trainerId === uid || data.trainer === name) {
            if (!grouped[data.clientName]) grouped[data.clientName] = [];
            grouped[data.clientName].push({ ...data, id: d.id });
          }
        });
        setProgressHistory(grouped);
      }
    );
    const unsubDiet = onSnapshot(
      query(collection(db, "dietLogs"), orderBy("createdAt", "asc")),
      (snap) => {
        const grouped: Record<string, any[]> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.trainerId === uid || data.trainer === name) {
            if (!grouped[data.clientName]) grouped[data.clientName] = [];
            grouped[data.clientName].push({ ...data, id: d.id });
          }
        });
        setDietHistory(grouped);
      }
    );
    return () => { unsubProgress(); unsubDiet(); };
  }, [uid]);

  const initials = (name || "?").split(" ").map((n: string) => n[0] || "").join("").toUpperCase() || "?";
  const myClients = clients.filter((c: any) => c.trainerId === uid);
  const myInstructions = instructions;
  const myTrainer = trainers.find((t: any) => t.id === uid);
  const progressClient = progressClientOverride || myClients[0]?.name || "";
  const setProgressClient = setProgressClientOverride;
  const dietClient = dietClientOverride || myClients[0]?.name || "";
  const setDietClient = setDietClientOverride;
  const myExpiredClients = myClients.filter((c) => c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive");
  const myLowClassClients = myClients.filter((c) => (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0 && c.status === "Active");

  const navItems = [
    { id: "clients", icon: "👥", label: "My Clients" },
    { id: "log", icon: "📝", label: "Log Session" },
    { id: "plans", icon: "📋", label: "Workout Plans" },
    { id: "library", icon: "🏋", label: "Exercise Library" },
    { id: "progress", icon: "📈", label: "Progress Tracking" },
    { id: "diet", icon: "🥗", label: "Diet & Habits" },
    { id: "payments", icon: "₹", label: "Payments" },
    { id: "instructions", icon: "📣", label: "Instructions", badge: myInstructions.filter((i) => i.priority === "high").length },
  ];

  const saveSession = async () => {
    if (!logClient) { setSessionError("Please select a client."); return; }
    setSessionError("");
    const dateStr = new Date(sessionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const loggedAt = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const now = new Date();
    const sessionDateTime = new Date(sessionDate);
    const hoursDiff = (now.getTime() - sessionDateTime.getTime()) / (1000 * 60 * 60);
    const isLate = hoursDiff > 2;
    const sessionData = {
      client: logClient, trainer: name, trainerId: uid, date: dateStr, loggedAt,
      type: sessionType, status: sessionStatus.toLowerCase().split(" ")[0],
      duration: Number(sessionDuration) || 0, late: isLate,
      notes: sessionNotes, modReason: sessionModReason,
      injuryFlag: injuryFlag || null,
      exercises: sessionExercises.map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, weight: e.weight })),
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "sessionLogs"), sessionData);
    const client = myClients.find((c) => c.name === logClient);
    if (client?.id) {
      await addDoc(collection(db, "trainers", uid, "clients", client.id, "sessions"), sessionData);
      const isMissed = sessionStatus.toLowerCase().includes("missed") || sessionStatus.toLowerCase().includes("cancelled");
      const newSessionsLogged = isMissed ? (client.sessionsLogged || 0) : (client.sessionsLogged || 0) + 1;
      const newClassesLeft = Math.max(0, (client.sessionsIncluded || 0) - newSessionsLogged);
      const newCompliance = client.sessionsIncluded > 0 ? Math.round((newSessionsLogged / client.sessionsIncluded) * 100) : 0;
      const updates: any = { lastSession: dateStr, lateLog: isLate, sessionsLogged: newSessionsLogged, classesLeft: newClassesLeft, compliance: newCompliance };
      if (isMissed) updates.missedSessions = (client.missedSessions || 0) + 1;
      await updateDoc(doc(db, "trainers", uid, "clients", client.id), updates);
    }
    if (myTrainer?.id && isLate) {
      await updateDoc(doc(db, "trainers", uid), { lateSubmissions: (myTrainer.lateSubmissions || 0) + 1 });
    }
    setSessionSaved(true);
    setSessionNotes(""); setSessionModReason(""); setInjuryFlag("");
    setTimeout(() => setSessionSaved(false), 3000);
  };

  return (
    <div className="app">
      <style>{S}</style>

      {/* ── CLIENT DETAIL MODAL ── */}
      {selectedClient && (
        <div className="overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="row mb16">
              <div className="av av-c" style={{ width: 48, height: 48, fontSize: 15 }}>{(selectedClient.name || "?").split(" ").map((n: string) => n[0] || "").join("")}</div>
              <div><div style={{ fontSize: 18, fontWeight: 800 }}>{selectedClient.name}</div><div style={{ fontSize: 12, color: "var(--t3)" }}>{selectedClient.programType} · {selectedClient.location}</div></div>
              <button className="btn btn-g btn-xs mla" onClick={() => setSelectedClient(null)}>✕</button>
            </div>
            {selectedClient.medicalNotes && <div className="alert al-y mb12">🩹 Medical: {selectedClient.medicalNotes} — modify exercises accordingly</div>}
            <div className="g4 mb16">
              {[
                { l: "Compliance", v: `${selectedClient.compliance || 0}%` },
                { l: "Sessions Done", v: `${selectedClient.sessionsLogged || 0}/${selectedClient.sessionsIncluded || 0}` },
                { l: "Classes Left", v: selectedClient.classesLeft || 0 },
                { l: "Missed", v: selectedClient.missedSessions || 0 },
              ].map((m, i) => (
                <div key={i} className="card-sm" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", color: i === 0 && (selectedClient.compliance || 0) < 70 ? "var(--red)" : "var(--t1)" }}>{m.v}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>{m.l}</div>
                </div>
              ))}
            </div>
            {selectedClient.medicalNotes && <div className="card-sm mb12"><div className="fs10 t3 mb4" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Medical Notes</div><div className="fs12 t2">{selectedClient.medicalNotes}</div></div>}
            <div className="mt8">
              <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Weight Progress</div>
              <LineChart data={(progressHistory[selectedClient?.name] || []).map((p: any) => p.weight)} color="var(--brand)" />
            </div>
            <div className="row gap8 mt16">
              <button className="btn btn-p btn-s" onClick={() => { setSelectedClient(null); setLogClient(selectedClient.name); setTab("log"); }}>Log Session</button>
              <button className="btn btn-g btn-s" onClick={() => { setSelectedClient(null); setProgressClient(selectedClient.name); setProgressTab("overview"); setTab("progress"); }}>📈 Progress</button>
              <button className="btn btn-g btn-s" onClick={() => { setSelectedClient(null); setDietClient(selectedClient.name); setTab("diet"); }}>🥗 Diet</button>
              <button className="btn btn-g btn-s mla" onClick={() => setSelectedClient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div className="sb">
        <div className="sb-logo">
          <div className="logo-yt">Your<span>Trainer</span></div>
          <div className="logo-tag">Trainer Dashboard</div>
          <div className="rp rp-t">🏋 Trainer</div>
        </div>
        <div className="sb-nav">
          {navItems.map((item) => (
            <div key={item.id} className={`ni ${tab === item.id ? "on" : ""}`} onClick={() => setTab(item.id)}>
              <span className="ni-ic">{item.icon}</span><span>{item.label}</span>
              {(item as any).badge > 0 && <span className="ni-b red">{(item as any).badge}</span>}
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div className="uc"><div className="av av-t">{initials}</div><div><div className="uc-n">{name}</div><div className="uc-r">Personal Trainer</div></div></div>
          <button className="btn-so" onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main">
        <div className="topbar">
          <div className="tb-t">{navItems.find((n) => n.id === tab)?.label}</div>
          {tab === "log" && sessionSaved && <div className="alert al-g" style={{ padding: "6px 14px" }}>✓ Session logged successfully!</div>}
        </div>
        <div className="content">

          {/* MY CLIENTS */}
          {tab === "clients" && (
            <>
              {myExpiredClients.length > 0 && <div className="alert al-r mb12">📅 {myExpiredClients.length} client plan{myExpiredClients.length > 1 ? "s" : ""} expired: {myExpiredClients.map((c) => c.name).join(", ")} — contact admin to renew</div>}
              {myLowClassClients.length > 0 && <div className="alert al-y mb12">⚠ Low classes: {myLowClassClients.map((c) => `${c.name} (${c.classesLeft} left)`).join(", ")} — inform admin for renewal</div>}
              <div className="sh"><div className="sh-l"><h2>My Clients</h2><p>{myClients.length} clients · {email}</p></div></div>
              <div className="g4">
                {[
                  { l: "Active Clients", v: myClients.length, c: "var(--blue)" },
                  { l: "Avg Compliance", v: `${Math.round(myClients.reduce((s, c) => s + (c.compliance || 0), 0) / (myClients.length || 1))}%`, c: "var(--green)" },
                  { l: "Pending Logs", v: myTrainer?.pendingLogs || 0, c: "var(--red)" },
                  { l: "Alerts", v: myClients.filter((c) => c.status !== "Active" || (c.compliance || 0) < 75 || (c.missedSessions || 0) > 3).length, c: "var(--yellow)" },
                ].map((s, i) => (
                  <div key={i} className="sc">
                    <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
                    <div className="sl">{s.l}</div>
                    <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="g2">
                {myClients.map((c) => (
                  <div key={c.id} className="cc" onClick={() => setSelectedClient(c)}>
                    <div className="row mb12">
                      <div className="av av-c">{(c.name || "?").split(" ").map((n: string) => n[0] || "").join("")}</div>
                      <div><div className="fw7 fs14 t1">{c.name}</div><div className="fs11 t3">{c.programType} · {c.location}</div></div>
                      <span className={`badge fs10 mla ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span>
                    </div>
                    {c.medicalNotes && <div className="alert al-y mb8 fs11">🩹 {c.medicalNotes}</div>}
                    <div className="row gap8 mb12">
                      <span className="fs11 t3">Compliance</span>
                      <div className="pw" style={{ flex: 1 }}><div className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${c.compliance || 0}%` }} /></div>
                      <span className="fs11 fw7">{c.compliance || 0}%</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                      {[
                        { v: `${c.sessionsLogged || 0}/${c.sessionsIncluded || 0}`, k: "Sessions", c: "var(--t1)" },
                        { v: c.classesLeft || 0, k: "Remaining", c: (c.classesLeft || 0) <= 3 ? "var(--red)" : "var(--t1)" },
                        { v: c.compliance || 0, k: "Compliance", c: "var(--green)" },
                      ].map((s, i) => (
                        <div key={i} style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: "8px", textAlign: "center" }}>
                          <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{s.k}</div>
                        </div>
                      ))}
                    </div>
                    <div className="row gap6 mt10" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-p btn-xs" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setLogClient(c.name); setTab("log"); }}>📝 Log Session</button>
                      <button className="btn btn-g btn-xs" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setProgressClient(c.name); setProgressTab("overview"); setTab("progress"); }}>📈 Progress</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* LOG SESSION */}
          {tab === "log" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Log Session</h2><p>Must be submitted within 2 hours of session end</p></div></div>
              <div className="g2">
                <div>
                  <div className="card mb16">
                    <div className="ch"><span className="ct">Session Details</span></div>
                    <div className="field"><label>Client *</label>
                      <select className="fi" value={logClient} onChange={(e) => setLogClient(e.target.value)}>
                        <option value="">Select client...</option>
                        {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="g2">
                      <div className="field"><label>Date *</label><input className="fi" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} /></div>
                      <div className="field"><label>Duration (min)</label><input className="fi" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} /></div>
                    </div>
                    <div className="field"><label>Session Status *</label>
                      <select className="fi" value={sessionStatus} onChange={(e) => setSessionStatus(e.target.value)}>
                        <option>Completed</option><option>Missed — Client No-Show</option><option>Missed — Trainer Unavailable</option><option>Modified (explain below)</option><option>Cancelled by Client</option>
                      </select>
                    </div>
                    <div className="field"><label>Session Type</label>
                      <select className="fi" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                        <option>Strength Training</option><option>Cardio</option><option>HIIT</option><option>Mobility</option><option>Rehab</option><option>Mixed</option>
                      </select>
                    </div>
                    <div className="field"><label>Quality Notes (Required)</label><textarea className="fi" rows={3} placeholder="What went well? Technique issues? Client energy? Weight changes?" value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} style={{ resize: "none" }} /></div>
                    <div className="field"><label>Modification Reason (if modified)</label><textarea className="fi" rows={2} placeholder="Why was the session modified from the plan?" value={sessionModReason} onChange={(e) => setSessionModReason(e.target.value)} style={{ resize: "none" }} /></div>
                  </div>
                  <div className="card mb16">
                    <div className="ch"><span className="ct">Injury / Risk Flag</span></div>
                    <div className="field"><label>Flag Type (if any)</label>
                      <select className="fi" value={injuryFlag} onChange={(e) => setInjuryFlag(e.target.value)}>
                        <option value="">No issues</option>
                        <option>Knee Pain</option><option>Back Pain</option><option>Shoulder Pain</option>
                        <option>Dizziness</option><option>Medical Risk — Needs Review</option><option>Client Requested Reduced Intensity</option>
                      </select>
                    </div>
                    {injuryFlag && <div className="alert al-r fs11">⚠ This flag will be visible to admin immediately</div>}
                  </div>
                </div>
                <div>
                  <div className="card mb16">
                    <div className="ch"><span className="ct">Exercises Logged</span><button className="btn btn-g btn-xs" onClick={() => setTab("library")}>+ From Library</button></div>
                    <div style={{ marginBottom: 8 }}>
                      <div className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--b1)" }}>
                        <span className="fs10 t3" style={{ flex: 1 }}>Exercise</span>
                        <span className="fs10 t3" style={{ width: 66, textAlign: "center" }}>Sets</span>
                        <span className="fs10 t3" style={{ width: 66, textAlign: "center" }}>Reps</span>
                        <span className="fs10 t3" style={{ width: 66, textAlign: "center" }}>Weight</span>
                      </div>
                      {sessionExercises.map((ex, i) => (
                        <div key={i} className="log-row" style={{ gridTemplateColumns: "1fr 60px 60px 60px 32px" }}>
                          <div><div className="fs12 fw6 t1">{ex.name}</div><div className="fs10 t3">{ex.muscles}</div></div>
                          <input className="log-inp" type="number" placeholder="3" value={ex.sets} onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, sets: e.target.value } : x))} />
                          <input className="log-inp" type="number" placeholder="10" value={ex.reps} onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, reps: e.target.value } : x))} />
                          <input className="log-inp" type="number" placeholder="0" value={ex.weight} onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, weight: e.target.value } : x))} />
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 14, padding: 0 }} onClick={() => setSessionExercises((p: any[]) => p.filter((_: any, j: number) => j !== i))}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-g btn-xs mt8" onClick={() => setTab("library")}>+ Add Exercise</button>
                  </div>

                  {logClient && (
                    <div className="card mb16">
                      <div className="ch"><span className="ct">Client Snapshot: {logClient}</span></div>
                      {(() => {
                        const c = myClients.find((cl) => cl.name === logClient);
                        if (!c) return null;
                        return (
                          <div className="col gap8">
                            {c.medicalNotes && <div className="alert al-y fs11">📌 {c.medicalNotes}</div>}
                            <div className="row"><span className="fs12 t3">Sessions Done</span><span className="fs12 fw7 mla">{c.sessionsLogged || 0}/{c.sessionsIncluded || 0}</span></div>
                            <div className="row"><span className="fs12 t3">Remaining</span><span className={`fs12 fw7 mla ${(c.classesLeft || 0) <= 3 ? "tr" : "tg"}`}>{c.classesLeft || 0} sessions</span></div>
                            <div className="row"><span className="fs12 t3">Last Session</span><span className="fs12 mla">{c.lastSession || "—"}</span></div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {sessionError && <div className="alert al-r mb8">{sessionError}</div>}
                  <button className="btn btn-p" style={{ width: "100%", padding: "13px", fontSize: 14 }} onClick={saveSession}>✓ Submit Session Log</button>
                  <div className="fs10 t3 mt8" style={{ textAlign: "center" }}>Late submissions are flagged to admin.</div>
                </div>
              </div>
            </>
          )}

          {/* WORKOUT PLANS */}
          {tab === "plans" && (
            <>
              <div className="sh">
                <div className="sh-l"><h2>Workout Plans</h2><p>Use admin-approved templates where possible</p></div>
                <div className="row gap8"><button className="btn btn-g btn-s">+ Diet Plan</button><button className="btn btn-p btn-s">+ Workout Plan</button></div>
              </div>
              <div className="col gap12">
                {APPROVED_TEMPLATES.map((t) => (
                  <div key={t.id} className="card">
                    <div className="row">
                      <div style={{ flex: 1 }}>
                        <div className="row gap12 mb8">
                          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                          <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                        </div>
                        <div className="fs12 t2 mb8">{t.description}</div>
                        <div className="row gap16"><span className="fs11 t3">📅 {t.days}</span><span className="fs11 t3">⏱ {t.duration}</span><span className="fs11 t3">🏋 {t.exercises} exercises</span></div>
                      </div>
                      <button className="btn btn-p btn-s">Use Template</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* EXERCISE LIBRARY */}
          {tab === "library" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Exercise Library</h2><p>Tap any exercise to add to current session</p></div></div>
              <div className="tabs mb16">
                {WORKOUT_CATEGORIES.map((cat) => (
                  <div key={cat} className={`tab ${libCat === cat ? "on" : ""}`} onClick={() => setLibCat(cat)}>{cat}</div>
                ))}
              </div>
              <div className="col gap8">
                {(WORKOUT_LIBRARY[libCat] || []).map((ex, i) => (
                  <div key={i} className="ex-card" onClick={() => { setSessionExercises((p: any[]) => [...p, { ...ex, sets: "3", reps: "10", weight: "0" }]); setTab("log"); }}>
                    <div>
                      <div className="fw6 fs13 t1">{ex.name}</div>
                      <div className="fs11 t3 mt4">{ex.muscles}</div>
                    </div>
                    <div className="row gap8">
                      <span className="badge bgr fs10">{ex.equipment}</span>
                      <span className={`badge fs10 ${ex.level === "Beginner" ? "bg" : ex.level === "Intermediate" ? "by" : "br"}`}>{ex.level}</span>
                      <span className="fs12 t3">+ Add</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PROGRESS TRACKING */}
          {tab === "progress" && (() => {
            const ph = progressHistory[progressClient] || progressHistory[Object.keys(progressHistory)[0]] || [];
            if (ph.length === 0) return (
              <>
                <div className="sh">
                  <div className="sh-l"><h2>Progress Tracking</h2><p>No progress logs yet for this client</p></div>
                  <select className="fi" style={{ width: "auto" }} value={progressClient} onChange={(e) => setProgressClient(e.target.value)}>
                    {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="alert al-b">No progress data yet. Log the first entry below.</div>
                <div className="card">
                  <div className="ch"><span className="ct">Log First Progress Entry</span></div>
                  <div className="g2">
                    {[["weight", "Weight (kg)"], ["bf", "Body Fat %"], ["chest", "Chest (cm)"], ["waist", "Waist (cm)"], ["hips", "Hips (cm)"], ["arms", "Arms (cm)"], ["thighs", "Thighs (cm)"], ["squat", "Squat (kg)"], ["bench", "Bench (kg)"], ["deadlift", "Deadlift (kg)"], ["pullup", "Pull-ups (reps)"]].map(([k, l]) => (
                      <div key={k} className="field">
                        <label>{l}</label>
                        <input className="fi" type="number" value={(newProgress as any)[k]} onChange={(e) => setNewProgress((p) => ({ ...p, [k]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-p btn-s mt8" onClick={async () => {
                    if (!progressClient) return;
                    await addDoc(collection(db, "progressLogs"), {
                      clientName: progressClient, trainer: name, trainerId: uid,
                      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                      ...Object.fromEntries(Object.entries(newProgress).map(([k, v]) => [k, Number(v) || 0])),
                      createdAt: serverTimestamp(),
                    });
                    setProgressSaved(true);
                    setNewProgress({ weight: "", bf: "", chest: "", waist: "", hips: "", arms: "", thighs: "", squat: "", bench: "", deadlift: "", pullup: "", notes: "" });
                    setTimeout(() => setProgressSaved(false), 3000);
                  }}>Save Progress Entry</button>
                  {progressSaved && <div className="alert al-g mt8">✓ Progress saved!</div>}
                </div>
              </>
            );
            const first = ph[0], last = ph[ph.length - 1];
            const client = myClients.find((c) => c.name === progressClient);
            return (
              <>
                <div className="sh">
                  <div className="sh-l"><h2>Progress Tracking</h2><p>{ph.length} entries · {progressClient}</p></div>
                  <div className="row gap8">
                    <select className="fi" style={{ width: "auto" }} value={progressClient} onChange={(e) => setProgressClient(e.target.value)}>
                      {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn btn-p btn-s" onClick={() => setShowLogProgress(!showLogProgress)}>+ Log Progress</button>
                  </div>
                </div>

                {showLogProgress && (
                  <div className="card">
                    <div className="ch"><span className="ct">New Progress Entry</span><span className="badge by fs10">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
                    <div className="g2">
                      {[["weight", "Weight (kg)"], ["bf", "Body Fat %"], ["chest", "Chest (cm)"], ["waist", "Waist (cm)"], ["hips", "Hips (cm)"], ["arms", "Arms (cm)"], ["thighs", "Thighs (cm)"], ["squat", "Squat (kg)"], ["bench", "Bench (kg)"], ["deadlift", "Deadlift (kg)"], ["pullup", "Pull-ups (reps)"]].map(([k, l]) => (
                        <div key={k} className="field">
                          <label>{l}</label>
                          <input className="fi" type="number" placeholder={String((last as any)[k])} value={(newProgress as any)[k]} onChange={(e) => setNewProgress((p) => ({ ...p, [k]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-p btn-s mt8" style={{ width: "100%" }} onClick={async () => {
                      if (!progressClient) return;
                      await addDoc(collection(db, "progressLogs"), {
                        clientName: progressClient, trainer: name, trainerId: uid,
                        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                        ...Object.fromEntries(Object.entries(newProgress).map(([k, v]) => [k, Number(v) || (last as any)[k] || 0])),
                        createdAt: serverTimestamp(),
                      });
                      setProgressSaved(true);
                      setShowLogProgress(false);
                      setNewProgress({ weight: "", bf: "", chest: "", waist: "", hips: "", arms: "", thighs: "", squat: "", bench: "", deadlift: "", pullup: "", notes: "" });
                      setTimeout(() => setProgressSaved(false), 3000);
                    }}>Save Progress Entry</button>
                    {progressSaved && <div className="alert al-g mt8">✓ Progress saved!</div>}
                  </div>
                )}

                <div className="g4">
                  {[
                    { l: "Current Weight", v: `${last.weight}kg`, sub: `Started: ${first.weight}kg`, delta: `${(last.weight - first.weight) > 0 ? "+" : ""}${(last.weight - first.weight).toFixed(1)}kg`, down: last.weight < first.weight, c: "var(--brand)" },
                    { l: "Body Fat", v: `${last.bf}%`, sub: `Started: ${first.bf}%`, delta: `${(last.bf - first.bf) > 0 ? "+" : ""}${(last.bf - first.bf).toFixed(1)}%`, down: last.bf < first.bf, c: "var(--purple)" },
                    { l: "Waist", v: `${last.waist}cm`, sub: `Started: ${first.waist}cm`, delta: `${last.waist - first.waist}cm`, down: last.waist < first.waist, c: "var(--blue)" },
                    { l: "Squat 1RM", v: `${last.squat}kg`, sub: `Started: ${first.squat}kg`, delta: `+${last.squat - first.squat}kg`, down: false, c: "var(--green)" },
                  ].map((s, i) => (
                    <div key={i} className="sc">
                      <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
                      <div className="sl">{s.l}</div>
                      <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
                      <div className="ss">{s.sub}</div>
                      <div className={`sd ${s.down || i === 3 ? "sup" : "sdn"}`}>{s.down || i === 3 ? "▲" : "▼"} {s.delta}</div>
                    </div>
                  ))}
                </div>

                <div className="tabs">
                  {[["overview", "Overview"], ["weight", "Weight"], ["measurements", "Measurements"], ["strength", "Strength"]].map(([id, label]) => (
                    <div key={id} className={`tab ${progressTab === id ? "on" : ""}`} onClick={() => setProgressTab(id)}>{label}</div>
                  ))}
                </div>

                {progressTab === "overview" && (
                  <div className="g2">
                    <div className="card">
                      <div className="ch"><span className="ct">Weight Journey</span><span className="badge bg">{Math.abs(last.weight - first.weight).toFixed(1)}kg {last.weight < first.weight ? "lost" : "gained"}</span></div>
                      <LineChart data={ph.map((p: any) => p.weight)} color="var(--brand)" />
                    </div>
                    <div className="card">
                      <div className="ch"><span className="ct">Strength Progress</span></div>
                      <LineChart data={ph.map((p: any) => p.squat)} color="var(--green)" />
                      <div className="row mt8 gap16">
                        <span className="fs11 t3">Squat: <span className="tg fw7">{last.squat}kg</span></span>
                        <span className="fs11 t3">Bench: <span className="tb fw7">{last.bench}kg</span></span>
                        <span className="fs11 t3">Deadlift: <span className="tp fw7">{last.deadlift}kg</span></span>
                      </div>
                    </div>
                    <div className="card">
                      <div className="ch"><span className="ct">Progress Timeline</span></div>
                      <div className="col gap4">
                        {ph.slice().reverse().map((p: any, i: number) => (
                          <div key={i} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--b1)" }}>
                            <div className="ad" style={{ background: i === 0 ? "var(--brand)" : "var(--s4)", flexShrink: 0, marginTop: 0 }} />
                            <span className="fs11 fw6 t2" style={{ marginLeft: 8, minWidth: 60 }}>{p.date}</span>
                            <span className="fs11 t3">{p.weight}kg · {p.waist}cm waist · Squat {p.squat}kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <div className="ch"><span className="ct">Body Measurements</span></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                        {[
                          { l: "Chest", k: "chest" }, { l: "Waist", k: "waist" }, { l: "Hips", k: "hips" },
                          { l: "Arms", k: "arms" }, { l: "Thighs", k: "thighs" }, { l: "Body Fat", k: "bf", unit: "%" },
                        ].map((m, i) => {
                          const delta = (last as any)[m.k] - (first as any)[m.k];
                          const good = m.k === "arms" ? delta > 0 : delta < 0;
                          return (
                            <div key={i} className="card-sm" style={{ textAlign: "center", padding: "10px 8px" }}>
                              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)" }}>{(last as any)[m.k]}{m.unit || "cm"}</div>
                              <div className="fs10 t3 mt4">{m.l}</div>
                              <div className={`fs10 fw7 mt4 ${good ? "tg" : "tr"}`}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}{m.unit || "cm"}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {progressTab === "weight" && (
                  <div className="col gap14">
                    <div className="card">
                      <div className="ch"><span className="ct">Weight Over Time (kg)</span>
                        <div className="row gap8">
                          <span className="badge bo fs10">Start: {first.weight}kg</span>
                          <span className="badge bg fs10">Now: {last.weight}kg</span>
                        </div>
                      </div>
                      <LineChart data={ph.map((p: any) => p.weight)} color="var(--brand)" />
                    </div>
                    <div className="card">
                      <div className="ch"><span className="ct">Body Fat %</span></div>
                      <LineChart data={ph.map((p: any) => p.bf)} color="var(--purple)" />
                    </div>
                  </div>
                )}

                {progressTab === "measurements" && (
                  <div className="col gap14">
                    <div className="g2">
                      {[
                        { l: "Chest (cm)", k: "chest", c: "var(--brand)" },
                        { l: "Waist (cm)", k: "waist", c: "var(--blue)" },
                        { l: "Hips (cm)", k: "hips", c: "var(--purple)" },
                        { l: "Arms (cm)", k: "arms", c: "var(--green)" },
                      ].map((m, i) => {
                        const delta = (last as any)[m.k] - (first as any)[m.k];
                        const good = m.k === "arms" ? delta > 0 : delta < 0;
                        return (
                          <div key={i} className="card">
                            <div className="ch"><span className="ct">{m.l}</span><span className={`badge fs10 ${good ? "bg" : "br"}`}>{delta > 0 ? "+" : ""}{delta}cm</span></div>
                            <LineChart data={ph.map((p: any) => (p as any)[m.k])} color={m.c} />
                            <div className="row mt8">
                              <span className="fs11 t3">Start: {(first as any)[m.k]}cm</span>
                              <span className="fs11 fw7 mla" style={{ color: m.c }}>Now: {(last as any)[m.k]}cm</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {progressTab === "strength" && (
                  <div className="col gap14">
                    <div className="g2">
                      {[
                        { l: "Squat (kg)", k: "squat", c: "var(--green)" },
                        { l: "Bench Press (kg)", k: "bench", c: "var(--brand)" },
                        { l: "Deadlift (kg)", k: "deadlift", c: "var(--purple)" },
                        { l: "Pull-ups (reps)", k: "pullup", c: "var(--blue)" },
                      ].map((m, i) => {
                        const delta = (last as any)[m.k] - (first as any)[m.k];
                        return (
                          <div key={i} className="card">
                            <div className="ch"><span className="ct">{m.l}</span><span className="badge bg fs10">+{delta}{m.k === "pullup" ? " reps" : "kg"}</span></div>
                            <LineChart data={ph.map((p: any) => (p as any)[m.k])} color={m.c} />
                            <div className="row mt8">
                              <span className="fs11 t3">Start: {(first as any)[m.k]}</span>
                              <span className="fs11 fw7 mla" style={{ color: m.c }}>Now: {(last as any)[m.k]}{m.k === "pullup" ? " reps" : "kg"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* DIET & HABITS */}
          {tab === "diet" && (() => {
            const dh = dietHistory[dietClient] || dietHistory[Object.keys(dietHistory)[0]] || [];
            const proteinTarget = 120, waterTarget = 3.0, stepsTarget = 10000, sleepTarget = 8;
            if (dh.length === 0) return (
              <>
                <div className="sh"><div className="sh-l"><h2>Diet & Habit Notes</h2><p>No logs yet</p></div>
                  <select className="fi" style={{ width: "auto" }} value={dietClient} onChange={(e) => setDietClient(e.target.value)}>
                    {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="alert al-b">No habit logs for {dietClient} yet. Log the first entry below.</div>
                <div className="card">
                  <div className="ch"><span className="ct">Log Today's Habits</span></div>
                  <div className="g2">
                    <div className="field"><label>Protein (g)</label><input className="fi" type="number" placeholder={`Target: ${proteinTarget}g`} value={newDiet.protein} onChange={(e) => setNewDiet((p) => ({ ...p, protein: e.target.value }))} /></div>
                    <div className="field"><label>Water (Litres)</label><input className="fi" type="number" step="0.1" placeholder={`Target: ${waterTarget}L`} value={newDiet.water} onChange={(e) => setNewDiet((p) => ({ ...p, water: e.target.value }))} /></div>
                    <div className="field"><label>Steps</label><input className="fi" type="number" placeholder={`Target: ${stepsTarget}`} value={newDiet.steps} onChange={(e) => setNewDiet((p) => ({ ...p, steps: e.target.value }))} /></div>
                    <div className="field"><label>Sleep (hours)</label><input className="fi" type="number" step="0.5" placeholder={`Target: ${sleepTarget}h`} value={newDiet.sleep} onChange={(e) => setNewDiet((p) => ({ ...p, sleep: e.target.value }))} /></div>
                  </div>
                  <div className="field"><label>Sleep Quality</label><select className="fi" value={newDiet.sleepQuality} onChange={(e) => setNewDiet((p) => ({ ...p, sleepQuality: e.target.value }))}><option>Great</option><option>Good</option><option>Average</option><option>Poor</option></select></div>
                  <div className="field"><label>Notes (optional)</label><textarea className="fi" rows={2} placeholder="Ate out, stress, travel..." value={newDiet.notes} onChange={(e) => setNewDiet((p) => ({ ...p, notes: e.target.value }))} style={{ resize: "none" }} /></div>
                  <button className="btn btn-p btn-s mt8" style={{ width: "100%" }} onClick={async () => {
                    if (!dietClient) return;
                    await addDoc(collection(db, "dietLogs"), {
                      clientName: dietClient, trainer: name, trainerId: uid,
                      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                      protein: Number(newDiet.protein) || 0, water: Number(newDiet.water) || 0,
                      steps: Number(newDiet.steps) || 0, sleep: Number(newDiet.sleep) || 0,
                      sleepQuality: newDiet.sleepQuality, notes: newDiet.notes, createdAt: serverTimestamp(),
                    });
                    setDietSaved(true);
                    setNewDiet({ protein: "", water: "", steps: "", sleep: "", sleepQuality: "Good", notes: "" });
                    setTimeout(() => setDietSaved(false), 3000);
                  }}>Save Habit Log</button>
                  {dietSaved && <div className="alert al-g mt8">✓ Habit log saved!</div>}
                </div>
              </>
            );
            const avgProtein = Math.round(dh.reduce((s: number, d: any) => s + d.protein, 0) / dh.length);
            const avgWater = (dh.reduce((s: number, d: any) => s + d.water, 0) / dh.length).toFixed(1);
            const avgSteps = Math.round(dh.reduce((s: number, d: any) => s + d.steps, 0) / dh.length);
            const avgSleep = (dh.reduce((s: number, d: any) => s + d.sleep, 0) / dh.length).toFixed(1);
            return (
              <>
                <div className="sh">
                  <div className="sh-l"><h2>Diet & Habit Notes</h2><p>Protein · Water · Steps · Sleep</p></div>
                  <select className="fi" style={{ width: "auto" }} value={dietClient} onChange={(e) => setDietClient(e.target.value)}>
                    {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {dietSaved && <div className="alert al-g">✓ Habit log saved for {dietClient}</div>}
                <div className="g4">
                  {[
                    { l: "Avg Protein", v: `${avgProtein}g`, target: `Target: ${proteinTarget}g`, pct: Math.round(avgProtein / proteinTarget * 100), c: "var(--brand)" },
                    { l: "Avg Water", v: `${avgWater}L`, target: `Target: ${waterTarget}L`, pct: Math.round(Number(avgWater) / waterTarget * 100), c: "var(--blue)" },
                    { l: "Avg Steps", v: avgSteps.toLocaleString(), target: `Target: ${stepsTarget.toLocaleString()}`, pct: Math.round(avgSteps / stepsTarget * 100), c: "var(--green)" },
                    { l: "Avg Sleep", v: `${avgSleep}h`, target: `Target: ${sleepTarget}h`, pct: Math.round(Number(avgSleep) / sleepTarget * 100), c: "var(--purple)" },
                  ].map((s, i) => (
                    <div key={i} className="sc">
                      <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
                      <div className="sl">{s.l}</div>
                      <div className="sv" style={{ color: s.c, fontSize: 26 }}>{s.v}</div>
                      <div className="ss">{s.target}</div>
                      <div className="pw mt8"><div className={`pb ${s.pct >= 90 ? "pb-g" : s.pct >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${Math.min(100, s.pct)}%` }} /></div>
                      <div className={`fs10 fw7 mt4 ${s.pct >= 90 ? "tg" : s.pct >= 70 ? "ty" : "tr"}`}>{s.pct}% of target</div>
                    </div>
                  ))}
                </div>
                <div className="g2">
                  <div className="card">
                    <div className="ch"><span className="ct">Log Today's Habits</span><span className="badge by fs10">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
                    <div className="g2">
                      <div className="field"><label>Protein (g)</label><input className="fi" type="number" placeholder={`Target: ${proteinTarget}g`} value={newDiet.protein} onChange={(e) => setNewDiet((p) => ({ ...p, protein: e.target.value }))} /></div>
                      <div className="field"><label>Water (Litres)</label><input className="fi" type="number" step="0.1" placeholder={`Target: ${waterTarget}L`} value={newDiet.water} onChange={(e) => setNewDiet((p) => ({ ...p, water: e.target.value }))} /></div>
                      <div className="field"><label>Steps</label><input className="fi" type="number" placeholder={`Target: ${stepsTarget}`} value={newDiet.steps} onChange={(e) => setNewDiet((p) => ({ ...p, steps: e.target.value }))} /></div>
                      <div className="field"><label>Sleep (hours)</label><input className="fi" type="number" step="0.5" placeholder={`Target: ${sleepTarget}h`} value={newDiet.sleep} onChange={(e) => setNewDiet((p) => ({ ...p, sleep: e.target.value }))} /></div>
                    </div>
                    <div className="field"><label>Sleep Quality</label><select className="fi" value={newDiet.sleepQuality} onChange={(e) => setNewDiet((p) => ({ ...p, sleepQuality: e.target.value }))}><option>Great</option><option>Good</option><option>Average</option><option>Poor</option></select></div>
                    <div className="field"><label>Notes (optional)</label><textarea className="fi" rows={2} placeholder="Ate out, stress, travel, period, illness..." value={newDiet.notes} onChange={(e) => setNewDiet((p) => ({ ...p, notes: e.target.value }))} style={{ resize: "none" }} /></div>
                    <button className="btn btn-p btn-s mt8" style={{ width: "100%" }} onClick={async () => {
                      if (!dietClient) return;
                      await addDoc(collection(db, "dietLogs"), {
                        clientName: dietClient, trainer: name, trainerId: uid,
                        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                        protein: Number(newDiet.protein) || 0, water: Number(newDiet.water) || 0,
                        steps: Number(newDiet.steps) || 0, sleep: Number(newDiet.sleep) || 0,
                        sleepQuality: newDiet.sleepQuality, notes: newDiet.notes, createdAt: serverTimestamp(),
                      });
                      setDietSaved(true);
                      setNewDiet({ protein: "", water: "", steps: "", sleep: "", sleepQuality: "Good", notes: "" });
                      setTimeout(() => setDietSaved(false), 3000);
                    }}>Save Habit Log</button>
                  </div>
                  <div className="col gap14">
                    <div className="card">
                      <div className="ch"><span className="ct">Protein (g) — Trend</span><span className={`badge fs10 ${avgProtein >= proteinTarget ? "bg" : avgProtein >= proteinTarget * 0.8 ? "by" : "br"}`}>Avg {avgProtein}g</span></div>
                      <LineChart data={dh.map((d: any) => d.protein)} color="var(--brand)" />
                    </div>
                    <div className="card">
                      <div className="ch"><span className="ct">Sleep (hours)</span><span className={`badge fs10 ${Number(avgSleep) >= 7 ? "bg" : "by"}`}>Avg {avgSleep}h</span></div>
                      <LineChart data={dh.map((d: any) => d.sleep)} color="var(--purple)" />
                    </div>
                  </div>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  <div style={{ padding: "16px 20px 0" }}><span className="ct">7-Day Habit Log</span></div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Date</th><th>Protein</th><th>Water</th><th>Steps</th><th>Sleep</th><th>Quality</th><th>Notes</th></tr></thead>
                      <tbody>
                        {dh.slice().reverse().map((d: any, i: number) => (
                          <tr key={i}>
                            <td className="fw6">{d.date}</td>
                            <td><span className={d.protein >= proteinTarget * 0.9 ? "tg fw7" : "tr fw7"}>{d.protein}g</span></td>
                            <td><span className={d.water >= waterTarget * 0.9 ? "tg fw7" : "ty fw7"}>{d.water}L</span></td>
                            <td><span className={d.steps >= stepsTarget * 0.8 ? "tg" : "ty"}>{d.steps.toLocaleString()}</span></td>
                            <td><span className={d.sleep >= 7 ? "tg" : "ty"}>{d.sleep}h</span></td>
                            <td><span className={`badge fs10 ${d.sleepQuality === "Great" ? "bg" : d.sleepQuality === "Good" ? "bb" : d.sleepQuality === "Average" ? "by" : "br"}`}>{d.sleepQuality}</span></td>
                            <td className="fs11 t3">{d.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <div className="ch"><span className="ct">Trainer Insights</span><span className="badge bb fs10">Auto-generated</span></div>
                  <div className="col gap8">
                    {avgProtein < proteinTarget * 0.85 && <div className="alert al-r">🥩 Protein averaging {avgProtein}g vs {proteinTarget}g target. Discuss high-protein meals.</div>}
                    {Number(avgSleep) < 7 && <div className="alert al-y">😴 Sleep averaging {avgSleep}h. Below 7h impairs recovery.</div>}
                    {avgSteps < stepsTarget * 0.7 && <div className="alert al-y">🚶 Steps averaging {avgSteps.toLocaleString()} vs 10,000 target.</div>}
                    {avgProtein >= proteinTarget * 0.9 && Number(avgSleep) >= 7 && avgSteps >= stepsTarget * 0.8 && <div className="alert al-g">✓ All habits on track this week. Acknowledge this in next session.</div>}
                  </div>
                </div>
              </>
            );
          })()}

          {/* PAYMENTS */}
          {tab === "payments" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Payments</h2><p>View only — contact admin to modify</p></div></div>
              <div className="alert al-b mb16">ℹ Payments are managed by admin. You can send reminders but cannot edit payment records.</div>
              <div className="g3">
                {[
                  { l: "Feb Revenue", v: `₹${((myTrainer?.revenue || 0) / 1000).toFixed(0)}K`, c: "var(--green)" },
                  { l: "Expiring Packages", v: `${myClients.filter((c) => c.status === "On Hold").length}`, c: "var(--yellow)" },
                  { l: "Sessions Remaining", v: myClients.reduce((s, c) => s + (c.classesLeft || 0), 0), c: "var(--blue)" },
                ].map((s, i) => (
                  <div key={i} className="sc"><div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} /><div className="sl">{s.l}</div><div className="sv" style={{ color: s.c, fontSize: 26 }}>{s.v}</div></div>
                ))}
              </div>
              <div className="card" style={{ padding: 0 }}>
                <div className="tw">
                  <table>
                    <thead><tr><th>Client</th><th>Sessions Remaining</th><th>Expires</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {myClients.map((c) => (
                        <tr key={c.id}>
                          <td className="t1 fw6">{c.name}</td>
                          <td><span className={(c.classesLeft || 0) <= 3 ? "tr fw7" : (c.classesLeft || 0) <= 6 ? "ty fw7" : "tg fw7"}>{c.classesLeft || 0} remaining</span></td>
                          <td className="fs11 t3">{c.endDate || "—"}</td>
                          <td><span className={`badge ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span></td>
                          <td>{c.status === "On Hold" ? <button className="btn btn-p btn-xs">Send Renewal Reminder</button> : c.status === "Inactive" ? <button className="btn btn-dn btn-xs">Follow Up</button> : <span className="tg fs11">✓ Active</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* INSTRUCTIONS */}
          {tab === "instructions" && (
            <>
              <div className="sh"><div className="sh-l"><h2>Instructions from Admin</h2><p>Read all high-priority items</p></div></div>
              <div className="col gap12">
                {myInstructions.map((ins) => (
                  <div key={ins.id} className="card" style={{ borderLeft: `3px solid ${ins.priority === "high" ? "var(--red)" : ins.priority === "medium" ? "var(--yellow)" : "var(--blue)"}` }}>
                    <div className="row mb8">
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{ins.title}</span>
                      <span className={`badge fs10 mla ${ins.priority === "high" ? "br" : ins.priority === "medium" ? "by" : "bb"}`}>{ins.priority}</span>
                      <span className="fs11 t3" style={{ marginLeft: 10 }}>{ins.date}</span>
                    </div>
                    <div className="fs13 t2">{ins.body}</div>
                    {ins.priority === "high" && <button className="btn btn-ok btn-xs mt12">✓ Mark as Read</button>}
                  </div>
                ))}
                {myInstructions.length === 0 && <div className="alert al-b">No instructions from admin yet.</div>}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP — ROOT COMPONENT (Router)
// This is the ONLY file Next.js touches.
// All it does: auth check → route to the right dashboard.
// ============================================================
export default function App() {
  const { user, profile, loading, logout } = useAuth();
  const [sharedClients, setSharedClients] = useState<Client[]>([]);
  const [sharedTrainers, setSharedTrainers] = useState<Trainer[]>([]);
  const [sharedInstructions, setSharedInstructions] = useState<Instruction[]>([]);
  const [sharedWarnings, setSharedWarnings] = useState<Warning[]>([]);
  const [sharedSessionLogs, setSharedSessionLogs] = useState<SessionLog[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let coreLoaded = 0;
    const checkReady = () => { if (++coreLoaded >= 3) setDbLoading(false); };

    const unsubClients = onSnapshot(collectionGroup(db, "clients"), (snap) => {
      setSharedClients(snap.docs.map((d) => ({ id: d.id, trainerId: d.ref.parent.parent?.id || "", ...(d.data() as any) })));
      checkReady();
    });
    const unsubTrainers = onSnapshot(collection(db, "trainers"), (snap) => {
      setSharedTrainers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      checkReady();
    });
    const unsubInstructions = onSnapshot(query(collection(db, "instructions"), orderBy("createdAt", "desc")), (snap) => {
      setSharedInstructions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      checkReady();
    });
    const unsubSessions = onSnapshot(query(collection(db, "sessionLogs"), orderBy("createdAt", "desc")), (snap) => {
      setSharedSessionLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    const unsubWarnings = onSnapshot(query(collection(db, "warnings"), orderBy("createdAt", "desc")), (snap) => {
      setSharedWarnings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    return () => { unsubClients(); unsubTrainers(); unsubInstructions(); unsubSessions(); unsubWarnings(); };
  }, [user]);

  // ── Loading screen ──
  if (loading || (user && dbLoading)) return (
    <>
      <style>{S}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508", fontFamily: "Outfit,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900 }}>Your<span style={{ color: "#ff4d00" }}>Trainer</span></div>
          <div style={{ color: "#606078", fontSize: 13, marginTop: 8 }}>Loading your dashboard...</div>
        </div>
      </div>
    </>
  );

  // ── Not logged in ──
  if (!user || !profile) return <><style>{S}</style><Login /></>;

  // ── Admin ──
  if (profile.role === "admin") return (
    <Admin
      name={profile.name || "Admin"}
      logout={logout}
      clients={sharedClients}
      trainers={sharedTrainers}
      instructions={sharedInstructions}
      warnings={sharedWarnings}
      sessionLogs={sharedSessionLogs}
    />
  );

  // ── Trainer ──
  if (profile.role === "trainer") return (
    <Trainer
      uid={profile.uid || ""}
      name={profile.name || "Trainer"}
      email={profile.email || ""}
      logout={logout}
      clients={sharedClients}
      trainers={sharedTrainers}
      instructions={sharedInstructions}
    />
  );

  // ── Client (coming soon) ──
  return (
    <>
      <style>{S}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508", fontFamily: "Outfit,sans-serif", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 900 }}>Your<span style={{ color: "#ff4d00" }}>Trainer</span></div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Welcome, {profile.name} 👋</div>
        <div style={{ color: "#606078", fontSize: 13 }}>Client dashboard — coming soon</div>
        <button style={{ padding: "10px 24px", background: "rgba(255,68,102,0.15)", color: "#ff4466", border: "1px solid rgba(255,68,102,0.3)", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }} onClick={logout}>Sign Out</button>
      </div>
    </>
  );
}
