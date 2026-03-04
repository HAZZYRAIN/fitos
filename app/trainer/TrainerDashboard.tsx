"use client";
import { useState } from "react";
import { TrainerProvider, useTrainer } from "./TrainerContext";
import { S } from "../styles/dashboard";
import type { Client, Trainer, Instruction } from "../types";

import MyClients   from "./tabs/MyClients";
import LogSession  from "./tabs/LogSession";
import WorkoutPlans from "./tabs/WorkoutPlans";
import ExerciseLibrary from "./tabs/ExerciseLibrary";
import ProgressTracking from "./tabs/ProgressTracking";
import DietHabits  from "./tabs/DietHabits";
import InstructionsFeed from "./tabs/InstructionsFeed";

const NAV_ITEMS = [
  { id: "clients",  icon: "👥", label: "My Clients" },
  { id: "log",      icon: "📝", label: "Log Session" },
  { id: "plans",    icon: "🏋", label: "Workout Plans" },
  { id: "library",  icon: "📚", label: "Exercise Library" },
  { id: "progress", icon: "📈", label: "Progress Tracking" },
  { id: "diet",     icon: "🥗", label: "Diet & Habits" },
  { id: "comms",    icon: "📣", label: "Instructions" },
];

function TrainerInner() {
  const { name, logout, tab, setTab, initials, myInstructions } = useTrainer();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unreadInstructions = myInstructions.filter((i: any) => !i.read).length;
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
        <div className="drawer-head">
          <div>
            <div className="logo-yt">Your<span>Trainer</span></div>
            <div className="logo-tag">Trainer Portal</div>
          </div>
          <div className="drawer-close" onClick={closeDrawer}>✕</div>
        </div>

        <div className="drawer-nav">
          <div className="drawer-section">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const badge = item.id === "comms" ? unreadInstructions : 0;
            return (
              <div key={item.id} className={`dni ${tab === item.id ? "on" : ""}`} onClick={() => navigate(item.id)}>
                <span className="dni-ic">{item.icon}</span>
                <span>{item.label}</span>
                {badge > 0 && <span className="dni-b">{badge}</span>}
              </div>
            );
          })}
        </div>

        <div className="drawer-foot">
          <div className="uc">
            <div className="av av-t">{initials}</div>
            <div><div className="uc-n">{name}</div><div className="uc-r">Trainer</div></div>
          </div>
          <button className="btn-so" onClick={() => { closeDrawer(); logout(); }}>Sign Out</button>
        </div>
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="sb">
        <div className="sb-logo">
          <div className="logo-yt">Your<span>Trainer</span></div>
          <div className="logo-tag">Trainer Portal</div>
          <div className="rp rp-t">🏋 Trainer</div>
        </div>
        <div className="sb-nav">
          {NAV_ITEMS.map((item) => {
            const badge = item.id === "comms" ? unreadInstructions : 0;
            return (
              <div key={item.id} className={`ni ${tab === item.id ? "on" : ""}`} onClick={() => setTab(item.id)}>
                <span className="ni-ic">{item.icon}</span>
                <span>{item.label}</span>
                {badge > 0 && <span className="ni-b">{badge}</span>}
              </div>
            );
          })}
        </div>
        <div className="sb-foot">
          <div className="uc">
            <div className="av av-t">{initials}</div>
            <div><div className="uc-n">{name}</div><div className="uc-r">Trainer</div></div>
          </div>
          <button className="btn-so" onClick={logout}>Sign Out</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main">
        <div className="topbar">
          {/* Hamburger — mobile only */}
          <div className="ham" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </div>
          <div className="tb-t">{currentLabel}</div>
          {unreadInstructions > 0 && (
            <div style={{ background: "var(--red)", color: "white", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>
              {unreadInstructions} new
            </div>
          )}
        </div>

        <div className="content">
          {tab === "clients"  && <MyClients />}
          {tab === "log"      && <LogSession />}
          {tab === "plans"    && <WorkoutPlans />}
          {tab === "library"  && <ExerciseLibrary />}
          {tab === "progress" && <ProgressTracking />}
          {tab === "diet"     && <DietHabits />}
          {tab === "comms"    && <InstructionsFeed />}
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
