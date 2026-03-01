"use client";
// ============================================================
// YOURTRAINER — APP ROUTER
// This file's only job: auth check → route to correct dashboard.
//
// Admin   → app/admin/AdminDashboard.tsx
// Trainer → app/trainer/TrainerDashboard.tsx
// Logged out → app/components/Login.tsx
// ============================================================
import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { collection, collectionGroup, onSnapshot, query, orderBy } from "firebase/firestore";

import { S } from "./styles/dashboard";
import Login from "./components/Login";
import AdminDashboard from "./admin/AdminDashboard";
import TrainerDashboard from "./trainer/TrainerDashboard";
import type { Client, Trainer, Instruction, Warning, SessionLog } from "./types";

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

  // ── Loading ──
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
    <AdminDashboard
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
    <TrainerDashboard
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
