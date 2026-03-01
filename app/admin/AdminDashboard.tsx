"use client";
import { AdminProvider, useAdmin } from "./AdminContext";
import { S } from "../styles/dashboard";
import type { Client, Trainer, Instruction, Warning, SessionLog } from "../types";

// ── Tab components ──
import Overview from "./tabs/Overview";
import TrainerPerformance from "./tabs/TrainerPerformance";
import Clients from "./tabs/Clients";
import Sessions from "./tabs/Sessions";
import Flags from "./tabs/Flags";
import Revenue from "./tabs/Revenue";
import Templates from "./tabs/Templates";
import Instructions from "./tabs/Instructions";
import Audit from "./tabs/Audit";
import TrainersList from "./tabs/TrainersList";

// ── Inner dashboard (has access to context) ──
function AdminInner() {
  const {
    name, logout, tab, setTab,
    trainers, clients, instructions, warnings,
    atRiskClients, flaggedClients, lowAttendance, pendingLogs,
    // Modals
    showChangePw, setShowChangePw,
    showEditClient, setShowEditClient,
    showAddTrainer, setShowAddTrainer,
    showAddClient, setShowAddClient,
    showInstruction, setShowInstruction,
    showWarning, setShowWarning,
    // Selected
    selectedTrainer, setSelectedTrainer,
    selectedClient, setSelectedClient,
    pwTarget, setPwTarget,
    // Forms
    newTrainer, setNewTrainer,
    newClient, setNewClient,
    newInstruction, setNewInstruction,
    newWarning, setNewWarning,
    pwForm, setPwForm, pwMsg,
    editForm, setEditForm,
    // Actions
    addTrainer, addClient, saveEditClient,
    postInstruction, addWarning, changePassword,
    toggleClientStatus, openEditClient,
    toggleTrainerStatus,
    setTrainerFilter, setClientSearch, setClientStatusFilter,
    setNewClient: setNC,
  } = useAdmin();

  const navItems = [
    { id: "overview",      icon: "◼",  label: "Control Room" },
    { id: "trainer-perf",  icon: "📊", label: "Trainer Performance" },
    { id: "clients",       icon: "👥", label: "Client Oversight", badge: atRiskClients.length, badgeColor: "red" },
    { id: "sessions",      icon: "📝", label: "Session Logs", badge: pendingLogs, badgeColor: "yellow" },
    { id: "flags",         icon: "🚨", label: "Flags & Alerts", badge: flaggedClients.length + lowAttendance.length, badgeColor: "red" },
    { id: "revenue",       icon: "₹",  label: "Revenue & Plans" },
    { id: "templates",     icon: "🏋", label: "Workout Templates" },
    { id: "comms",         icon: "📣", label: "Instructions Feed" },
    { id: "audit",         icon: "🔒", label: "Audit Trail" },
    { id: "trainers-list", icon: "👤", label: "Trainers" },
  ];

  return (
    <div className="app">
      <style>{S}</style>

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showChangePw && (
        <div className="overlay" onClick={() => { setShowChangePw(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Change Password — {pwTarget?.name}</div>
            <div className="fs12 t3 mb16">Use Firebase Console → Authentication to change passwords in production.</div>
            {pwMsg && <div className={`alert ${pwMsg.startsWith("✓") ? "al-g" : "al-r"} mb12`}>{pwMsg}</div>}
            <div className="field"><label>New Password</label><input className="fi" type="password" placeholder="Min 6 characters" value={pwForm.newPw} onChange={(e) => setPwForm((p: any) => ({ ...p, newPw: e.target.value }))} /></div>
            <div className="field"><label>Confirm Password</label><input className="fi" type="password" placeholder="Re-enter password" value={pwForm.confirmPw} onChange={(e) => setPwForm((p: any) => ({ ...p, confirmPw: e.target.value }))} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowChangePw(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={changePassword}>Update Password</button></div>
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
            <div className="field"><label>Full Name</label><input className="fi" placeholder="e.g. Rahul Verma" value={newTrainer.name} onChange={(e) => setNewTrainer((p: any) => ({ ...p, name: e.target.value }))} /></div>
            <div className="field"><label>Email</label><input className="fi" type="email" placeholder="trainer@yourtrainer.in" value={newTrainer.email} onChange={(e) => setNewTrainer((p: any) => ({ ...p, email: e.target.value }))} /></div>
            <div className="field"><label>Speciality</label><input className="fi" placeholder="e.g. Weight Loss & HIIT" value={newTrainer.speciality} onChange={(e) => setNewTrainer((p: any) => ({ ...p, speciality: e.target.value }))} /></div>
            <div className="field"><label>Plan</label><select className="fi" value={newTrainer.plan} onChange={(e) => setNewTrainer((p: any) => ({ ...p, plan: e.target.value }))}><option>Starter</option><option>Pro</option></select></div>
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
              <div className="field"><label>Full Name *</label><input className="fi" placeholder="Client name" value={newClient.name} onChange={(e) => setNewClient((p: any) => ({ ...p, name: e.target.value }))} /></div>
              <div className="field"><label>Email (optional)</label><input className="fi" type="email" placeholder="client@email.com" value={newClient.email} onChange={(e) => setNewClient((p: any) => ({ ...p, email: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Gender</label>
                <select className="fi" value={newClient.gender} onChange={(e) => setNewClient((p: any) => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Age (optional)</label><input className="fi" type="number" placeholder="25" value={newClient.age} onChange={(e) => setNewClient((p: any) => ({ ...p, age: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Assign Trainer *</label>
                <select className="fi" value={newClient.trainerId} onChange={(e) => {
                  const t = trainers.find((tr) => tr.id === e.target.value);
                  setNewClient((p: any) => ({ ...p, trainerId: e.target.value, trainerName: t?.name || "" }));
                }}>
                  <option value="">Select trainer...</option>
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Program Type</label>
                <select className="fi" value={newClient.programType} onChange={(e) => setNewClient((p: any) => ({ ...p, programType: e.target.value }))}>
                  <option>1-on-1</option><option>Couple</option><option>Online</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Plan Start Date</label><input className="fi" type="date" value={newClient.startDate} onChange={(e) => setNewClient((p: any) => ({ ...p, startDate: e.target.value }))} /></div>
              <div className="field"><label>Plan End Date</label><input className="fi" type="date" value={newClient.endDate} onChange={(e) => setNewClient((p: any) => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Sessions Included</label><input className="fi" type="number" placeholder="24" value={newClient.sessionsIncluded} onChange={(e) => setNewClient((p: any) => ({ ...p, sessionsIncluded: e.target.value }))} /></div>
              <div className="field"><label>Plan Name</label><input className="fi" placeholder="e.g. Monthly 24-session" value={newClient.plan} onChange={(e) => setNewClient((p: any) => ({ ...p, plan: e.target.value }))} /></div>
            </div>
            <div className="g2">
              <div className="field"><label>Location</label><input className="fi" placeholder="e.g. HSR Layout" value={newClient.location} onChange={(e) => setNewClient((p: any) => ({ ...p, location: e.target.value }))} /></div>
              <div className="field"><label>Status</label>
                <select className="fi" value={newClient.status} onChange={(e) => setNewClient((p: any) => ({ ...p, status: e.target.value }))}>
                  <option>Active</option><option>On Hold</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Medical Notes (optional)</label><textarea className="fi" rows={2} placeholder="Any injuries or conditions..." value={newClient.medicalNotes} onChange={(e) => setNewClient((p: any) => ({ ...p, medicalNotes: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowAddClient(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={addClient}>Add Client</button></div>
          </div>
        </div>
      )}

      {/* ── POST INSTRUCTION MODAL ── */}
      {showInstruction && (
        <div className="overlay" onClick={() => setShowInstruction(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Post Instruction to Trainers</div>
            <div className="field"><label>Title *</label><input className="fi" placeholder="e.g. Holi holiday — no sessions Mar 14" value={newInstruction.title} onChange={(e) => setNewInstruction((p: any) => ({ ...p, title: e.target.value }))} /></div>
            <div className="field"><label>Details</label><textarea className="fi" rows={3} placeholder="Additional context..." value={newInstruction.body} onChange={(e) => setNewInstruction((p: any) => ({ ...p, body: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="field"><label>Priority</label>
              <select className="fi" value={newInstruction.priority} onChange={(e) => setNewInstruction((p: any) => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowInstruction(false)}>Cancel</button><button className="btn btn-p btn-s mla" onClick={postInstruction}>Post Instruction</button></div>
          </div>
        </div>
      )}

      {/* ── LOG WARNING MODAL ── */}
      {showWarning && (
        <div className="overlay" onClick={() => setShowWarning(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Log Trainer Warning</div>
            <div className="field"><label>Trainer</label>
              <select className="fi" value={newWarning.trainer} onChange={(e) => setNewWarning((p: any) => ({ ...p, trainer: e.target.value }))}>
                <option value="">Select trainer...</option>
                {trainers.map((t) => <option key={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Warning Type</label>
              <select className="fi" value={newWarning.type} onChange={(e) => setNewWarning((p: any) => ({ ...p, type: e.target.value }))}>
                <option>Verbal Warning</option><option>Written Warning</option><option>Final Warning</option>
              </select>
            </div>
            <div className="field"><label>Note *</label><textarea className="fi" rows={3} placeholder="What happened?" value={newWarning.note} onChange={(e) => setNewWarning((p: any) => ({ ...p, note: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="field"><label>Follow-up Action</label><input className="fi" placeholder="e.g. Review in 2 weeks" value={newWarning.followUp} onChange={(e) => setNewWarning((p: any) => ({ ...p, followUp: e.target.value }))} /></div>
            <div className="row mt16"><button className="btn btn-g btn-s" onClick={() => setShowWarning(false)}>Cancel</button><button className="btn btn-dn btn-s mla" onClick={addWarning}>Log Warning</button></div>
          </div>
        </div>
      )}

      {/* ── TRAINER DETAIL MODAL ── */}
      {selectedTrainer && (
        <div className="overlay" onClick={() => setSelectedTrainer(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="row mb16">
              <div className="av av-t" style={{ width: 48, height: 48 }}>{selectedTrainer.avatar}</div>
              <div style={{ marginLeft: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedTrainer.name}</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>{selectedTrainer.speciality}</div>
                <div className="row gap8 mt4">
                  <span className={`badge fs10 ${selectedTrainer.status === "active" ? "bg" : "br"}`}>{selectedTrainer.status}</span>
                  <span className={`badge fs10 ${selectedTrainer.plan === "Pro" ? "bo" : "bgr"}`}>{selectedTrainer.plan}</span>
                </div>
              </div>
              <div className="mla">
                {selectedTrainer.avatar || (selectedTrainer.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <button className="btn btn-g btn-xs" onClick={() => setSelectedTrainer(null)}>✕</button>
            </div>
            <div className="g4 mb16">
              {[
                { l: "Clients", v: clients.filter((c) => c.trainerId === selectedTrainer.id).length },
                { l: "Sessions", v: `${selectedTrainer.sessions || 0}/${selectedTrainer.sessionsAssigned || 0}` },
                { l: "Revenue", v: `₹${((selectedTrainer.revenue || 0) / 1000).toFixed(0)}K` },
                { l: "Score", v: `${selectedTrainer.accountabilityScore || 0}%` },
              ].map((m, i) => (
                <div key={i} className="card-sm" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{m.l}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--fd)", marginTop: 4 }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div className="g2 mb16">
              <div>
                <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Clients</div>
                {clients.filter((c) => c.trainerId === selectedTrainer.id).map((c) => (
                  <div key={c.id} className="row gap8 mt8" style={{ cursor: "pointer" }} onClick={() => { setSelectedTrainer(null); setSelectedClient(c); }}>
                    <span className="fs13 fw6 t1">{c.name}</span>
                    <span className={`badge fs10 ml8 ${c.status === "Inactive" ? "bgr" : "bg"}`}>{c.status === "Inactive" ? "inactive" : "active"}</span>
                    <div className="pw" style={{ flex: 1, margin: "0 10px" }}><div className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${c.compliance || 0}%` }} /></div>
                    <span className="fs11 t3">{c.compliance || 0}%</span>
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
              <button className={`btn btn-s ${selectedTrainer.status === "active" ? "btn-dn" : "btn-ok"}`} onClick={() => toggleTrainerStatus(selectedTrainer.id, selectedTrainer.status || "active")}>
                {selectedTrainer.status === "active" ? "Suspend" : "Activate"}
              </button>
              <button className="btn btn-warn btn-s" onClick={() => { setNewWarning((p: any) => ({ ...p, trainer: selectedTrainer.name })); setSelectedTrainer(null); setShowWarning(true); }}>Log Warning</button>
              <button className="btn btn-g btn-s" onClick={() => { setPwTarget(selectedTrainer); setSelectedTrainer(null); setShowChangePw(true); }}>🔑 Change Password</button>
              <button className="btn btn-g btn-s" onClick={() => { setTrainerFilter(selectedTrainer.name); setClientSearch(""); setClientStatusFilter("all"); setSelectedTrainer(null); setTab("clients"); }}>View All Clients</button>
              <button className="btn btn-p btn-s mla" onClick={() => { setNewClient((p: any) => ({ ...p, trainerName: selectedTrainer.name, trainerId: selectedTrainer.id })); setSelectedTrainer(null); setShowAddClient(true); }}>+ Add Client</button>
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
                {(selectedClient.name || "?").split(" ").map((n: string) => n[0] || "").join("")}
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
              <button className={`btn btn-s ${selectedClient.status === "Inactive" ? "btn-ok" : "btn-dn"}`} onClick={() => toggleClientStatus(selectedClient.id, selectedClient.trainerId, selectedClient.status)}>
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
        </div>
        <div className="content">
          {tab === "overview"      && <Overview />}
          {tab === "trainer-perf"  && <TrainerPerformance />}
          {tab === "clients"       && <Clients />}
          {tab === "sessions"      && <Sessions />}
          {tab === "flags"         && <Flags />}
          {tab === "revenue"       && <Revenue />}
          {tab === "templates"     && <Templates />}
          {tab === "comms"         && <Instructions />}
          {tab === "audit"         && <Audit />}
          {tab === "trainers-list" && <TrainersList />}
        </div>
      </div>
    </div>
  );
}

// ── Public export wraps AdminInner with provider ──
export default function AdminDashboard({
  name, logout, clients, trainers, instructions, warnings, sessionLogs,
}: {
  name: string; logout: () => void;
  clients: Client[]; trainers: Trainer[];
  instructions: Instruction[]; warnings: Warning[];
  sessionLogs: SessionLog[];
}) {
  return (
    <AdminProvider name={name} logout={logout} clients={clients} trainers={trainers} instructions={instructions} warnings={warnings} sessionLogs={sessionLogs}>
      <AdminInner />
    </AdminProvider>
  );
}
