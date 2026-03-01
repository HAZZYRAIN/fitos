"use client";
import { TrainerProvider, useTrainer } from "./TrainerContext";
import { S } from "../styles/dashboard";
import type { Client, Trainer, Instruction } from "../types";

import MyClients from "./tabs/MyClients";
import LogSession from "./tabs/LogSession";
import WorkoutPlans from "./tabs/WorkoutPlans";
import ExerciseLibrary from "./tabs/ExerciseLibrary";
import ProgressTracking from "./tabs/ProgressTracking";
import DietHabits from "./tabs/DietHabits";
import TrainerInstructions from "./tabs/TrainerInstructions";
import { LineChart } from "../components/ui/Charts";

function TrainerInner() {
  const {
    name, logout, initials, tab, setTab,
    myInstructions, sessionSaved,
    selectedClient, setSelectedClient,
    setLogClient, setProgressClient, setProgressTab, setDietClient,
    progressHistory,
  } = useTrainer();

  const navItems = [
    { id: "clients",      icon: "👥", label: "My Clients" },
    { id: "log",          icon: "📝", label: "Log Session" },
    { id: "plans",        icon: "📋", label: "Workout Plans" },
    { id: "library",      icon: "🏋", label: "Exercise Library" },
    { id: "progress",     icon: "📈", label: "Progress Tracking" },
    { id: "diet",         icon: "🥗", label: "Diet & Habits" },
    { id: "instructions", icon: "📣", label: "Instructions", badge: myInstructions.filter((i) => i.priority === "high").length },
  ];

  return (
    <div className="app">
      <style>{S}</style>

      {/* ── CLIENT DETAIL MODAL ── */}
      {selectedClient && (
        <div className="overlay" onClick={() => setSelectedClient(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="row mb16">
              <div className="av av-c" style={{ width: 48, height: 48, fontSize: 15 }}>{(selectedClient.name || "?").split(" ").map((n: string) => n[0] || "").join("")}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedClient.name}</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>{selectedClient.programType} · {selectedClient.location}</div>
              </div>
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
          {tab === "clients"      && <MyClients />}
          {tab === "log"          && <LogSession />}
          {tab === "plans"        && <WorkoutPlans />}
          {tab === "library"      && <ExerciseLibrary />}
          {tab === "progress"     && <ProgressTracking />}
          {tab === "diet"         && <DietHabits />}
          {tab === "instructions" && <TrainerInstructions />}
        </div>
      </div>
    </div>
  );
}

export default function TrainerDashboard({
  uid, name, email, logout, clients, trainers, instructions,
}: {
  uid: string; name: string; email: string; logout: () => void;
  clients: Client[]; trainers: Trainer[]; instructions: Instruction[];
}) {
  return (
    <TrainerProvider uid={uid} name={name} email={email} logout={logout} clients={clients} trainers={trainers} instructions={instructions}>
      <TrainerInner />
    </TrainerProvider>
  );
}
