"use client";
import { useState } from "react";
import { AdminProvider, useAdmin } from "./AdminContext";
import { S } from "../styles/dashboard";
import type { Client, Trainer, Instruction, Warning, SessionLog } from "../types";

import Overview from "./tabs/Overview";
import TrainerPerformance from "./tabs/TrainerPerformance";
import Clients from "./tabs/Clients";
import Sessions from "./tabs/Sessions";
import Flags from "./tabs/Flags";
import Templates from "./tabs/Templates";
import Instructions from "./tabs/Instructions";
import TrainersList from "./tabs/TrainersList";

const NAV_ITEMS = [
  { id: "overview",      icon: "◼",  label: "Control Room" },
  { id: "trainer-perf",  icon: "📊", label: "Trainer Performance" },
  { id: "clients",       icon: "👥", label: "Client Oversight",  badgeKey: "atRisk",   badgeColor: "" },
  { id: "sessions",      icon: "📝", label: "Session Logs",      badgeKey: "pending",  badgeColor: "yellow" },
  { id: "flags",         icon: "🚨", label: "Flags & Alerts",    badgeKey: "flags",    badgeColor: "" },
  { id: "templates",     icon: "🏋", label: "Workout Templates" },
  { id: "comms",         icon: "📣", label: "Instructions Feed" },
  { id: "trainers-list", icon: "👤", label: "Trainers" },
];

function AdminInner() {
  const {
    name, logout, tab, setTab,
    trainers, clients, instructions, warnings,
    atRiskClients, flaggedClients, lowAttendance, pendingLogs,
    showChangePw, setShowChangePw,
    showEditClient, setShowEditClient,
    showAddTrainer, setShowAddTrainer,
    showAddClient, setShowAddClient,
    showInstruction, setShowInstruction,
    showWarning, setShowWarning,
    showRenewClient, setShowRenewClient,
    selectedTrainer, setSelectedTrainer,
    renewTarget, renewForm, setRenewForm, renewLoading, renewMsg,
    pwTarget, setPwTarget,
    newTrainer, setNewTrainer,
    newClient, setNewClient,
    newInstruction, setNewInstruction,
    newWarning, setNewWarning,
    pwForm, setPwForm, pwMsg,
    editForm, setEditForm,
    addTrainer, addClient, saveEditClient,
    renewClient, openRenewClient,
    postInstruction, addWarning, changePassword,
    toggleTrainerStatus,
    setNewClient: setNC,
  } = useAdmin();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const badges: Record<string, number> = {
    atRisk:  atRiskClients.length,
    pending: pendingLogs,
    flags:   flaggedClients.length + lowAttendance.length,
  };

  const closeDrawer = () => setDrawerOpen(false);
  const navigate = (id: string) => { setTab(id); closeDrawer(); };

  const currentLabel = NAV_ITEMS.find((n) => n.id === tab)?.label || "Dashboard";

  return (
    <div className="app">
      <style>{S}</style>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} />

      {/* ── MOBILE DRAWER ── */}
      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        {/* Drawer header */}
        <div className="drawer-head">
          <div>
            <div className="logo-yt">Your<span>Trainer</span></div>
            <div className="logo-tag">Admin Panel</div>
          </div>
          <div className="drawer-close" onClick={closeDrawer}>✕</div>
        </div>

        {/* Drawer nav */}
        <div className="drawer-nav">
          <div className="drawer-section">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const badge = item.badgeKey ? badges[item.badgeKey] || 0 : 0;
            return (
              <div key={item.id} className={`dni ${tab === item.id ? "on" : ""}`} onClick={() => navigate(item.id)}>
                <span className="dni-ic">{item.icon}</span>
                <span>{item.label}</span>
                {badge > 0 && <span className={`dni-b ${item.badgeColor || ""}`}>{badge}</span>}
              </div>
            );
          })}
        </div>

        {/* Drawer footer */}
        <div className="drawer-foot">
          <div className="uc">
            <div className="av av-a">SA</div>
            <div><div className="uc-n">{name}</div><div className="uc-r">Super Admin</div></div>
          </div>
          <button className="btn-so" onClick={() => { closeDrawer(); logout(); }}>Sign Out</button>
        </div>
      </div>

      {/* ── ALL MODALS (unchanged) ── */}

      {showChangePw && (
        <div className="overlay" onClick={() => setShowChangePw(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Change Password — {pwTarget?.name}</div>
            <div className="fs12 t3 mb16">Use Firebase Console → Authentication to change passwords in production.</div>
            {pwMsg && <div className={`alert ${pwMsg.startsWith("✓") ? "al-g" : "al-r"} mb12`}>{pwMsg}</div>}
            <div className="field"><label>New Password</label>
              <input className="fi" type="password" placeholder="Min 6 characters" value={pwForm.newPw} onChange={(e) => setPwForm((p: any) => ({ ...p, newPw: e.target.value }))} />
            </div>
            <div className="field"><label>Confirm Password</label>
              <input className="fi" type="password" placeholder="Re-enter password" value={pwForm.confirmPw} onChange={(e) => setPwForm((p: any) => ({ ...p, confirmPw: e.target.value }))} />
            </div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowChangePw(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={changePassword}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddTrainer && (
        <div className="overlay" onClick={() => setShowAddTrainer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Add New Trainer</div>
            <div className="field"><label>Full Name</label>
              <input className="fi" placeholder="e.g. Rahul Verma" value={newTrainer.name} onChange={(e) => setNewTrainer((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="field"><label>Email</label>
              <input className="fi" type="email" placeholder="trainer@yourtrainer.in" value={newTrainer.email} onChange={(e) => setNewTrainer((p: any) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="field"><label>Speciality</label>
              <input className="fi" placeholder="e.g. Weight Loss & HIIT" value={newTrainer.speciality} onChange={(e) => setNewTrainer((p: any) => ({ ...p, speciality: e.target.value }))} />
            </div>
            <div className="field"><label>Plan</label>
              <select className="fi" value={newTrainer.plan} onChange={(e) => setNewTrainer((p: any) => ({ ...p, plan: e.target.value }))}>
                <option>Starter</option><option>Pro</option>
              </select>
            </div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowAddTrainer(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={addTrainer}>Add Trainer</button>
            </div>
          </div>
        </div>
      )}

      {showAddClient && (
        <div className="overlay" onClick={() => setShowAddClient(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Add New Client</div>
            <div className="g2">
              <div className="field"><label>Full Name *</label>
                <input className="fi" placeholder="Client name" value={newClient.name} onChange={(e) => setNewClient((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field"><label>Email</label>
                <input className="fi" type="email" placeholder="client@email.com" value={newClient.email} onChange={(e) => setNewClient((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Gender</label>
                <select className="fi" value={newClient.gender} onChange={(e) => setNewClient((p: any) => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Age</label>
                <input className="fi" type="number" placeholder="25" value={newClient.age} onChange={(e) => setNewClient((p: any) => ({ ...p, age: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Assign Trainer *</label>
                <select className="fi" value={newClient.trainerId} onChange={(e) => { const t = trainers.find((tr) => tr.id === e.target.value); setNewClient((p: any) => ({ ...p, trainerId: e.target.value, trainerName: t?.name || "" })); }}>
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
              <div className="field"><label>Start Date</label>
                <input className="fi" type="date" value={newClient.startDate} onChange={(e) => setNewClient((p: any) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="field"><label>End Date</label>
                <input className="fi" type="date" value={newClient.endDate} onChange={(e) => setNewClient((p: any) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Sessions Included</label>
                <input className="fi" type="number" placeholder="24" value={newClient.sessionsIncluded} onChange={(e) => setNewClient((p: any) => ({ ...p, sessionsIncluded: e.target.value }))} />
              </div>
              <div className="field"><label>Plan Name</label>
                <input className="fi" placeholder="e.g. Monthly 24-session" value={newClient.plan} onChange={(e) => setNewClient((p: any) => ({ ...p, plan: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Location</label>
                <input className="fi" placeholder="e.g. HSR Layout" value={newClient.location} onChange={(e) => setNewClient((p: any) => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="field"><label>Status</label>
                <select className="fi" value={newClient.status} onChange={(e) => setNewClient((p: any) => ({ ...p, status: e.target.value }))}>
                  <option>Active</option><option>On Hold</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Medical Notes</label>
              <textarea className="fi" rows={2} placeholder="Any injuries or conditions..." value={newClient.medicalNotes} onChange={(e) => setNewClient((p: any) => ({ ...p, medicalNotes: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowAddClient(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={addClient}>Add Client</button>
            </div>
          </div>
        </div>
      )}

      {showInstruction && (
        <div className="overlay" onClick={() => setShowInstruction(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Post Instruction</div>
            <div className="field"><label>Title *</label>
              <input className="fi" placeholder="e.g. No sessions on Mar 14" value={newInstruction.title} onChange={(e) => setNewInstruction((p: any) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="field"><label>Details</label>
              <textarea className="fi" rows={3} placeholder="Additional context..." value={newInstruction.body} onChange={(e) => setNewInstruction((p: any) => ({ ...p, body: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="field"><label>Priority</label>
              <select className="fi" value={newInstruction.priority} onChange={(e) => setNewInstruction((p: any) => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div className="field"><label>Send To</label>
              <select className="fi" value={newInstruction.target} onChange={(e) => setNewInstruction((p: any) => ({ ...p, target: e.target.value }))}>
                <option value="all">📢 All Trainers</option>
                {trainers.map((t) => <option key={t.id} value={t.id}>👤 {t.name}</option>)}
              </select>
            </div>
            {newInstruction.target !== "all" && (
              <div className="alert al-b fs11 mb8">
                📌 Only visible to {trainers.find((t) => t.id === newInstruction.target)?.name || "selected trainer"}.
              </div>
            )}
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowInstruction(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={postInstruction}>Post</button>
            </div>
          </div>
        </div>
      )}

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
            <div className="field"><label>Note *</label>
              <textarea className="fi" rows={3} placeholder="What happened?" value={newWarning.note} onChange={(e) => setNewWarning((p: any) => ({ ...p, note: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="field"><label>Follow-up Action</label>
              <input className="fi" placeholder="e.g. Review in 2 weeks" value={newWarning.followUp} onChange={(e) => setNewWarning((p: any) => ({ ...p, followUp: e.target.value }))} />
            </div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowWarning(false)}>Cancel</button>
              <button className="btn btn-dn btn-s mla" onClick={addWarning}>Log Warning</button>
            </div>
          </div>
        </div>
      )}

      {showRenewClient && renewTarget && (
        <div className="overlay" onClick={() => setShowRenewClient(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">🔄 Renew Client — {renewTarget.name}</div>
            <div className="g2 mb16">
              <div className="card-sm" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Sessions Used</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", color: "var(--t1)" }}>{renewTarget.sessionsLogged || 0}/{renewTarget.sessionsIncluded || 0}</div>
              </div>
              <div className="card-sm" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Classes Left</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", color: (renewTarget.classesLeft || 0) <= 2 ? "var(--red)" : "var(--t1)" }}>{renewTarget.classesLeft || 0}</div>
              </div>
            </div>
            <div className="field">
              <label>Renewal Type</label>
              <div className="row gap8 mt4">
                <button className={`btn btn-s ${renewForm.mode === "add" ? "btn-p" : "btn-g"}`} style={{ flex: 1 }} onClick={() => setRenewForm((p: any) => ({ ...p, mode: "add" }))}>➕ Add Sessions</button>
                <button className={`btn btn-s ${renewForm.mode === "reset" ? "btn-p" : "btn-g"}`} style={{ flex: 1 }} onClick={() => setRenewForm((p: any) => ({ ...p, mode: "reset" }))}>🔄 Fresh Reset</button>
              </div>
            </div>
            <div className="alert al-b fs11 mb12">
              {renewForm.mode === "add"
                ? `➕ Adds to existing. Currently ${renewTarget.sessionsIncluded || 0} sessions, ${renewTarget.classesLeft || 0} remaining.`
                : "🔄 Fresh reset — sessions logged, compliance, missed all reset to zero."}
            </div>
            <div className="field">
              <label>{renewForm.mode === "add" ? "Sessions to Add *" : "New Session Count *"}</label>
              <input className="fi" type="number" placeholder={renewForm.mode === "add" ? "e.g. 12" : "e.g. 24"} value={renewForm.sessions} onChange={(e) => setRenewForm((p: any) => ({ ...p, sessions: e.target.value }))} />
            </div>
            <div className="field">
              <label>New End Date *</label>
              <input className="fi" type="date" value={renewForm.endDate} onChange={(e) => setRenewForm((p: any) => ({ ...p, endDate: e.target.value }))} />
            </div>
            {renewForm.sessions && (
              <div className="alert al-b fs11 mb8">
                {renewForm.mode === "add"
                  ? `After: ${(renewTarget.sessionsIncluded || 0) + Number(renewForm.sessions)} total, ${(renewTarget.classesLeft || 0) + Number(renewForm.sessions)} remaining.`
                  : `After: ${renewForm.sessions} sessions, fresh start.`}
              </div>
            )}
            {renewMsg && <div className={`alert ${renewMsg.startsWith("✓") ? "al-g" : "al-r"} mb8`}>{renewMsg}</div>}
            <div className="row mt16 gap8">
              <button className="btn btn-g btn-s" onClick={() => setShowRenewClient(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={renewClient} disabled={renewLoading} style={{ opacity: renewLoading ? 0.7 : 1 }}>
                {renewLoading ? "Saving..." : "✓ Confirm Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTrainer && (
        <div className="overlay" onClick={() => setSelectedTrainer(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="row mb16">
              <div className="av av-t" style={{ width: 48, height: 48 }}>
                {(selectedTrainer.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ marginLeft: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--t1)" }}>{selectedTrainer.name}</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>{selectedTrainer.speciality}</div>
                <div className="row gap8 mt4">
                  <span className={`badge fs10 ${selectedTrainer.status === "active" ? "bg" : "br"}`}>{selectedTrainer.status}</span>
                  <span className={`badge fs10 ${selectedTrainer.plan === "Pro" ? "bo" : "bgr"}`}>{selectedTrainer.plan}</span>
                </div>
              </div>
              <button className="btn btn-g btn-xs mla" onClick={() => setSelectedTrainer(null)}>✕</button>
            </div>
            <div className="g4 mb16">
              {[
                { l: "Clients",   v: clients.filter((c) => c.trainerId === selectedTrainer.id).length },
                { l: "Sessions",  v: `${selectedTrainer.sessions || 0}/${selectedTrainer.sessionsAssigned || 0}` },
                { l: "Late Logs", v: selectedTrainer.lateSubmissions || 0 },
                { l: "Score",     v: `${selectedTrainer.accountabilityScore || 0}%` },
              ].map((m, i) => (
                <div key={i} className="card-sm" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{m.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", color: "var(--t1)" }}>{m.v}</div>
                </div>
              ))}
            </div>
            <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Clients</div>
            {clients.filter((c) => c.trainerId === selectedTrainer.id).map((c) => (
              <div key={c.id} className="row gap8 mt8" style={{ padding: "6px 0", borderBottom: "1px solid var(--b1)" }}>
                <span className="fs13 fw6 t1" style={{ flex: 1 }}>{c.name}</span>
                <span className={`badge fs10 ${c.status === "Inactive" ? "br" : "bg"}`}>{c.status}</span>
                {((c.classesLeft || 0) <= 2 || (c.endDate && new Date(c.endDate) < new Date())) && (
                  <button className="btn btn-warn btn-xs" onClick={(e) => { e.stopPropagation(); setSelectedTrainer(null); openRenewClient(c); }}>Renew</button>
                )}
                <div className="pw" style={{ width: 60 }}>
                  <div className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${c.compliance || 0}%` }} />
                </div>
                <span className="fs11 t3">{c.compliance || 0}%</span>
              </div>
            ))}
            {clients.filter((c) => c.trainerId === selectedTrainer.id).length === 0 && (
              <div className="fs12 t3">No clients assigned yet</div>
            )}
            <div className="row gap8 flex-wrap mt16">
              <button className={`btn btn-s ${selectedTrainer.status === "active" ? "btn-dn" : "btn-ok"}`} onClick={() => toggleTrainerStatus(selectedTrainer.id, selectedTrainer.status || "active")}>
                {selectedTrainer.status === "active" ? "Suspend" : "Activate"}
              </button>
              <button className="btn btn-warn btn-s" onClick={() => { setNewWarning((p: any) => ({ ...p, trainer: selectedTrainer.name })); setSelectedTrainer(null); setShowWarning(true); }}>Warn</button>
              <button className="btn btn-g btn-s" onClick={() => { setPwTarget(selectedTrainer); setSelectedTrainer(null); setShowChangePw(true); }}>🔑 Password</button>
              <button className="btn btn-p btn-s mla" onClick={() => { setNC((p: any) => ({ ...p, trainerName: selectedTrainer.name, trainerId: selectedTrainer.id })); setSelectedTrainer(null); setShowAddClient(true); }}>+ Client</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sb">
        <div className="sb-logo">
          <div className="logo-yt">Your<span>Trainer</span></div>
          <div className="logo-tag">Admin Panel</div>
          <div className="rp rp-a">⚡ Super Admin</div>
        </div>
        <div className="sb-nav">
          {NAV_ITEMS.map((item) => {
            const badge = item.badgeKey ? badges[item.badgeKey] || 0 : 0;
            return (
              <div key={item.id} className={`ni ${tab === item.id ? "on" : ""}`} onClick={() => setTab(item.id)}>
                <span className="ni-ic">{item.icon}</span>
                <span>{item.label}</span>
                {badge > 0 && <span className={`ni-b ${item.badgeColor || ""}`}>{badge}</span>}
              </div>
            );
          })}
        </div>
        <div className="sb-foot">
          <div className="uc">
            <div className="av av-a">SA</div>
            <div><div className="uc-n">{name}</div><div className="uc-r">Super Admin</div></div>
          </div>
          <button className="btn-so" onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          {/* Hamburger — mobile only */}
          <div className="ham" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </div>
          <div className="tb-t">{currentLabel}</div>
          {tab === "trainers-list" && <button className="btn btn-p btn-s" onClick={() => setShowAddTrainer(true)}>+ Trainer</button>}
          {tab === "clients"       && <button className="btn btn-p btn-s" onClick={() => setShowAddClient(true)}>+ Client</button>}
          {tab === "comms"         && <button className="btn btn-p btn-s" onClick={() => setShowInstruction(true)}>+ Post</button>}
        </div>

        {/* Page content */}
        <div className="content">
          {tab === "overview"      && <Overview />}
          {tab === "trainer-perf"  && <TrainerPerformance />}
          {tab === "clients"       && <Clients />}
          {tab === "sessions"      && <Sessions />}
          {tab === "flags"         && <Flags />}
          {tab === "templates"     && <Templates />}
          {tab === "comms"         && <Instructions />}
          {tab === "trainers-list" && <TrainersList />}
        </div>
      </div>
    </div>
  );
}

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
