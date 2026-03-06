"use client";
import { useState, useEffect } from "react";
import { useAdmin } from "../AdminContext";
import ClientDetail from "../../components/ClientDetail";
import { db } from "../../../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// ── Types ──────────────────────────────────────────────────
interface ProgressEntry {
  id: string;
  clientId: string;
  clientName?: string;
  date: string;
  loggedBy?: string;
  source?: string;
  type?: string;
  // Measurements
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  // Nutrition
  calories?: number;
  protein?: number;
  water?: number;
  // Habits
  sleep?: number;
  steps?: number;
  sleepQuality?: string;
  mood?: string;
  // Session Performance
  exercise?: string;
  reps?: number;
  weightLifted?: number;
  rpe?: number;
  endurance?: number;
  notes?: string;
  createdAt?: any;
}

// ── Delta chip ─────────────────────────────────────────────
function Delta({ current, previous, unit = "", lowerIsBetter = false }: {
  current?: number; previous?: number; unit?: string; lowerIsBetter?: boolean;
}) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (diff === 0) return <span style={{ fontSize: 10, color: "var(--t3)" }}>= same</span>;
  const good = lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: good ? "var(--green)" : "var(--red)" }}>
      {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}{unit}
    </span>
  );
}

// ── Progress tab content ───────────────────────────────────
function ProgressTab({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [entries, setEntries]           = useState<ProgressEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeSection, setActiveSection] = useState("measurements");

  useEffect(() => {
    // ✅ FIX 1: Both clientId AND clientName must be available
    if (!clientId || !clientName) {
      setLoading(false);
      setEntries([]);
      return;
    }

    setLoading(true);

    // ✅ FIX 2: Query by clientId (primary) - most reliable
    const q = query(
      collection(db, "progressLogs"),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );

    let isMounted = true; // ✅ FIX 3: Prevent state updates after unmount

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        if (!isMounted) return;

        const docs = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            clientId: data.clientId || clientId,
            clientName: data.clientName || clientName,
            date: data.date || "",
            loggedBy: data.loggedBy || "",
            source: data.source || "",
            type: data.type || "",
            weight: data.weight,
            chest: data.chest,
            waist: data.waist,
            hips: data.hips,
            arms: data.arms,
            calories: data.calories,
            protein: data.protein,
            water: data.water,
            sleep: data.sleep,
            steps: data.steps,
            sleepQuality: data.sleepQuality,
            mood: data.mood,
            exercise: data.exercise,
            reps: data.reps,
            weightLifted: data.weightLifted,
            rpe: data.rpe,
            endurance: data.endurance,
            notes: data.notes,
            createdAt: data.createdAt,
          } as ProgressEntry;
        });

        setEntries(docs);
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        
        console.error("ProgressTab listener error:", err);
        
        // ✅ FIX 4: Fallback if composite index not created
        if (err.code === "failed-precondition") {
          const fallbackQ = query(
            collection(db, "progressLogs"),
            where("clientId", "==", clientId)
          );

          onSnapshot(
            fallbackQ,
            (snap) => {
              if (!isMounted) return;
              
              const docs = snap.docs
                .map((d) => {
                  const data = d.data();
                  return {
                    id: d.id,
                    clientId: data.clientId || clientId,
                    clientName: data.clientName || clientName,
                    date: data.date || "",
                    loggedBy: data.loggedBy || "",
                    source: data.source || "",
                    type: data.type || "",
                    weight: data.weight,
                    chest: data.chest,
                    waist: data.waist,
                    hips: data.hips,
                    arms: data.arms,
                    calories: data.calories,
                    protein: data.protein,
                    water: data.water,
                    sleep: data.sleep,
                    steps: data.steps,
                    sleepQuality: data.sleepQuality,
                    mood: data.mood,
                    exercise: data.exercise,
                    reps: data.reps,
                    weightLifted: data.weightLifted,
                    rpe: data.rpe,
                    endurance: data.endurance,
                    notes: data.notes,
                    createdAt: data.createdAt,
                  } as ProgressEntry;
                })
                // ✅ FIX 5: Manual sort by createdAt (desc)
                .sort((a, b) => {
                  const aTime = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
                  const bTime = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
                  return bTime - aTime;
                });

              setEntries(docs);
              setLoading(false);
            },
            (fallbackErr) => {
              if (!isMounted) return;
              console.error("Fallback listener error:", fallbackErr);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      }
    );

    // ✅ FIX 6: Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [clientId, clientName]);

  // ✅ FIX 7: Latest = index 0 (desc order), Previous = index 1
  const latest = entries[0];
  const prev   = entries[1];

  const sections = [
    { id: "measurements", label: "📏 Body"       },
    { id: "nutrition",    label: "🥗 Nutrition"   },
    { id: "habits",       label: "💤 Habits"      },
    { id: "performance",  label: "🏋 Performance" },
    { id: "history",      label: "📋 History"     },
  ];

  if (loading) return (
    <div className="fs12 t3" style={{ padding: "12px 0" }}>Loading progress data...</div>
  );

  if (entries.length === 0) return (
    <div style={{
      textAlign: "center", padding: "20px 0",
      background: "var(--bg2)", borderRadius: 8, marginTop: 8,
    }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
      <div className="fs13 fw6 t2">No progress logged yet</div>
      <div className="fs11 t3" style={{ marginTop: 4 }}>
        Trainer session logs will appear here automatically
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 10 }}>

      {/* Source badge */}
      {entries.some((e) => e.source === "session_log") && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 7, marginBottom: 10,
          background: "rgba(30,138,76,.08)", border: "1px solid rgba(30,138,76,.2)",
          fontSize: 11, color: "var(--green)", fontWeight: 600,
        }}>
          ✓ {entries.filter((e) => e.source === "session_log").length} entries from trainer session logs
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {sections.map((s) => (
          <div
            key={s.id}
            className={`tab ${activeSection === s.id ? "on" : ""}`}
            style={{ flexShrink: 0, fontSize: 11 }}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Last logged info */}
      {latest && (
        <div className="fs10 t3" style={{ marginBottom: 10 }}>
          Last logged: <strong style={{ color: "var(--t2)" }}>{latest.date}</strong>
          {latest.loggedBy && <> by <strong style={{ color: "var(--brand1)" }}>{latest.loggedBy}</strong></>}
          {entries.length > 1 && <span style={{ marginLeft: 8 }}>· {entries.length} total entries</span>}
        </div>
      )}

      {/* ── MEASUREMENTS ── */}
      {activeSection === "measurements" && (
        <div className="prog-grid">
          {[
            { label: "Weight", key: "weight", unit: "kg", icon: "⚖️", lowerIsBetter: false },
            { label: "Chest",  key: "chest",  unit: "cm", icon: "📐", lowerIsBetter: false },
            { label: "Waist",  key: "waist",  unit: "cm", icon: "📐", lowerIsBetter: true  },
            { label: "Hips",   key: "hips",   unit: "cm", icon: "📐", lowerIsBetter: false },
            { label: "Arms",   key: "arms",   unit: "cm", icon: "💪", lowerIsBetter: false },
          ].map((m) => {
            const cur = latest?.[m.key as keyof ProgressEntry] as number | undefined;
            const prv = prev?.[m.key as keyof ProgressEntry] as number | undefined;
            if (cur == null) return null;
            return (
              <div key={m.key} className="prog-card">
                <div className="prog-icon">{m.icon}</div>
                <div className="prog-label">{m.label}</div>
                <div className="prog-value">{cur}<span className="prog-unit">{m.unit}</span></div>
                {prv != null && (
                  <div className="prog-prev">
                    prev: {prv}{m.unit}{" "}
                    <Delta current={cur} previous={prv} unit={m.unit} lowerIsBetter={m.lowerIsBetter} />
                  </div>
                )}
              </div>
            );
          }).filter(Boolean)}
          {!latest?.weight && !latest?.chest && !latest?.waist && (
            <div className="fs12 t3" style={{ gridColumn: "1/-1" }}>No body measurement data yet.</div>
          )}
        </div>
      )}

      {/* ── NUTRITION ── */}
      {activeSection === "nutrition" && (
        <div className="prog-grid">
          {[
            { label: "Calories", key: "calories", unit: "kcal", icon: "🔥", lowerIsBetter: false },
            { label: "Protein",  key: "protein",  unit: "g",    icon: "🥩", lowerIsBetter: false },
            { label: "Water",    key: "water",    unit: "L",    icon: "💧", lowerIsBetter: false },
          ].map((m) => {
            const cur = latest?.[m.key as keyof ProgressEntry] as number | undefined;
            const prv = prev?.[m.key as keyof ProgressEntry] as number | undefined;
            if (cur == null) return null;
            return (
              <div key={m.key} className="prog-card">
                <div className="prog-icon">{m.icon}</div>
                <div className="prog-label">{m.label}</div>
                <div className="prog-value">{cur}<span className="prog-unit">{m.unit}</span></div>
                {prv != null && (
                  <div className="prog-prev">
                    prev: {prv}{m.unit}{" "}
                    <Delta current={cur} previous={prv} unit={m.unit} lowerIsBetter={m.lowerIsBetter} />
                  </div>
                )}
              </div>
            );
          }).filter(Boolean)}
          {!latest?.calories && !latest?.protein && !latest?.water && (
            <div className="fs12 t3" style={{ gridColumn: "1/-1" }}>No nutrition data yet.</div>
          )}
        </div>
      )}

      {/* ── HABITS ── */}
      {activeSection === "habits" && (
        <div className="prog-grid">
          {latest?.sleep != null && (
            <div className="prog-card">
              <div className="prog-icon">😴</div>
              <div className="prog-label">Sleep</div>
              <div className="prog-value">{latest.sleep}<span className="prog-unit">hrs</span></div>
              {prev?.sleep != null && (
                <div className="prog-prev">
                  prev: {prev.sleep}hrs <Delta current={latest.sleep} previous={prev.sleep} unit="hrs" />
                </div>
              )}
            </div>
          )}
          {latest?.steps != null && (
            <div className="prog-card">
              <div className="prog-icon">👟</div>
              <div className="prog-label">Steps</div>
              <div className="prog-value">{(latest.steps || 0).toLocaleString()}</div>
              {prev?.steps != null && (
                <div className="prog-prev">
                  prev: {(prev.steps || 0).toLocaleString()}{" "}
                  <Delta current={latest.steps} previous={prev.steps} unit="" />
                </div>
              )}
            </div>
          )}
          {latest?.sleepQuality && (
            <div className="prog-card">
              <div className="prog-icon">🌙</div>
              <div className="prog-label">Sleep Quality</div>
              <div className="prog-value" style={{ fontSize: 14 }}>{latest.sleepQuality}</div>
              {prev?.sleepQuality && <div className="prog-prev">prev: {prev.sleepQuality}</div>}
            </div>
          )}
          {latest?.mood && (
            <div className="prog-card">
              <div className="prog-icon">
                {latest.mood === "great" ? "😄" : latest.mood === "good" ? "🙂" : latest.mood === "okay" ? "😐" : "😔"}
              </div>
              <div className="prog-label">Mood</div>
              <div className="prog-value" style={{ fontSize: 16, textTransform: "capitalize" }}>{latest.mood}</div>
              {prev?.mood && <div className="prog-prev">prev: {prev.mood}</div>}
            </div>
          )}
          {latest?.sleep == null && latest?.steps == null && !latest?.mood && (
            <div className="fs12 t3" style={{ gridColumn: "1/-1" }}>No habit data yet.</div>
          )}
        </div>
      )}

      {/* ── PERFORMANCE ── */}
      {activeSection === "performance" && (
        <div className="prog-grid">
          {latest?.exercise && (
            <div className="prog-card" style={{ gridColumn: "span 2" }}>
              <div className="prog-icon">🏋</div>
              <div className="prog-label">Exercise</div>
              <div className="prog-value" style={{ fontSize: 15 }}>{latest.exercise}</div>
            </div>
          )}
          {latest?.reps != null && (
            <div className="prog-card">
              <div className="prog-icon">🔁</div>
              <div className="prog-label">Reps</div>
              <div className="prog-value">{latest.reps}</div>
              {prev?.reps != null && (
                <div className="prog-prev">
                  prev: {prev.reps} <Delta current={latest.reps} previous={prev.reps} unit="" />
                </div>
              )}
            </div>
          )}
          {latest?.weightLifted != null && (
            <div className="prog-card">
              <div className="prog-icon">⚡</div>
              <div className="prog-label">Weight Lifted</div>
              <div className="prog-value">{latest.weightLifted}<span className="prog-unit">kg</span></div>
              {prev?.weightLifted != null && (
                <div className="prog-prev">
                  prev: {prev.weightLifted}kg{" "}
                  <Delta current={latest.weightLifted} previous={prev.weightLifted} unit="kg" />
                </div>
              )}
            </div>
          )}
          {latest?.rpe != null && (
            <div className="prog-card">
              <div className="prog-icon">💪</div>
              <div className="prog-label">RPE</div>
              <div className="prog-value">{latest.rpe}<span className="prog-unit">/10</span></div>
              {prev?.rpe != null && (
                <div className="prog-prev">
                  prev: {prev.rpe} <Delta current={latest.rpe} previous={prev.rpe} unit="" />
                </div>
              )}
            </div>
          )}
          {latest?.endurance != null && (
            <div className="prog-card">
              <div className="prog-icon">🏃</div>
              <div className="prog-label">Endurance</div>
              <div className="prog-value">{latest.endurance}<span className="prog-unit">min</span></div>
              {prev?.endurance != null && (
                <div className="prog-prev">
                  prev: {prev.endurance}min{" "}
                  <Delta current={latest.endurance} previous={prev.endurance} unit="min" />
                </div>
              )}
            </div>
          )}
          {latest?.notes && (
            <div className="prog-card" style={{ gridColumn: "span 2" }}>
              <div className="prog-icon">📝</div>
              <div className="prog-label">Trainer Notes</div>
              <div className="fs12 t2" style={{ marginTop: 4, lineHeight: 1.5 }}>{latest.notes}</div>
            </div>
          )}
          {latest?.reps == null && latest?.weightLifted == null && latest?.rpe == null && latest?.endurance == null && (
            <div className="fs12 t3" style={{ gridColumn: "1/-1" }}>No performance data yet.</div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeSection === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e, i) => (
            <div key={e.id} style={{
              background: "var(--bg2)", border: "1px solid var(--b0)",
              borderRadius: 8, padding: "10px 12px",
            }}>
              <div className="row gap8 mb8">
                <div className="fs12 fw7 t1">{e.date}</div>
                {e.loggedBy && <div className="fs10 t3">by {e.loggedBy}</div>}
                {e.source === "session_log" && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                    background: "rgba(59,130,246,.1)", color: "var(--blue)",
                  }}>Session</span>
                )}
                {i === 0 && <span className="badge bg fs10 mla">Latest</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                {e.weight       != null && <span className="fs11 t2">⚖️ {e.weight}kg</span>}
                {e.waist        != null && <span className="fs11 t2">📐 Waist {e.waist}cm</span>}
                {e.chest        != null && <span className="fs11 t2">📐 Chest {e.chest}cm</span>}
                {e.hips         != null && <span className="fs11 t2">📐 Hips {e.hips}cm</span>}
                {e.arms         != null && <span className="fs11 t2">💪 Arms {e.arms}cm</span>}
                {e.calories     != null && <span className="fs11 t2">🔥 {e.calories}kcal</span>}
                {e.protein      != null && <span className="fs11 t2">🥩 {e.protein}g protein</span>}
                {e.water        != null && <span className="fs11 t2">💧 {e.water}L water</span>}
                {e.sleep        != null && <span className="fs11 t2">😴 {e.sleep}hrs sleep</span>}
                {e.steps        != null && <span className="fs11 t2">👟 {(e.steps||0).toLocaleString()} steps</span>}
                {e.sleepQuality        && <span className="fs11 t2">🌙 {e.sleepQuality}</span>}
                {e.mood                && <span className="fs11 t2">😊 Mood: {e.mood}</span>}
                {e.exercise            && <span className="fs11 t2">🏋 {e.exercise}</span>}
                {e.reps         != null && <span className="fs11 t2">🔁 {e.reps} reps</span>}
                {e.weightLifted != null && <span className="fs11 t2">⚡ {e.weightLifted}kg lifted</span>}
                {e.rpe          != null && <span className="fs11 t2">💪 RPE {e.rpe}/10</span>}
                {e.endurance    != null && <span className="fs11 t2">🏃 {e.endurance}min endurance</span>}
                {e.notes               && <span className="fs11 t3" style={{ fontStyle: "italic" }}>"{e.notes}"</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Clients component ─────────────────────────────────
export default function Clients() {
  const {
    filteredClients, trainers, clients,
    clientSearch, setClientSearch,
    trainerFilter, setTrainerFilter,
    clientStatusFilter, setClientStatusFilter,
    atRiskClients, expiredClients, lowClassClients,
    openRenewClient, openEditClient,
    showEditClient, setShowEditClient,
    editForm, setEditForm,
    saveEditClient,
    name,
  } = useAdmin();

  const [detailClient, setDetailClient]     = useState<any>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab]           = useState<Record<string, string>>({});

  const getTab = (id: string) => activeTab[id] || "overview";
  const setTab = (id: string, tab: string) => setActiveTab((p) => ({ ...p, [id]: tab }));

  // ✅ FIX 8: Force refresh of displayed data when clients prop changes
  useEffect(() => {
    // This ensures we see fresh client data even after admin edits
    setExpandedClient(null);
    setActiveTab({});
  }, [clients.length]); // Only trigger on length change to avoid excessive renders

  if (detailClient) {
    return (
      <ClientDetail
        client={detailClient}
        role="admin"
        loggerName={name}
        loggerUid="admin"
        onBack={() => setDetailClient(null)}
      />
    );
  }

  return (
    <>
      <style>{`
        /* Progress grid */
        .prog-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        @media (min-width: 480px) { .prog-grid { grid-template-columns: 1fr 1fr 1fr; } }
        .prog-card {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 9px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 3px;
        }
        .prog-icon  { font-size: 16px; }
        .prog-label { font-size: 9px; font-weight: 700; color: var(--t4); text-transform: uppercase; letter-spacing: 0.7px; }
        .prog-value { font-size: 20px; font-weight: 800; font-family: var(--fd); color: var(--t1); line-height: 1.1; }
        .prog-unit  { font-size: 11px; font-weight: 500; color: var(--t3); margin-left: 2px; }
        .prog-prev  { font-size: 10px; color: var(--t3); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }

        /* Client card tabs */
        .cl-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--b0); margin: 10px 0 0; overflow-x: auto; }
        .cl-tab {
          font-size: 11px; font-weight: 600; color: var(--t3);
          padding: 6px 10px; cursor: pointer; white-space: nowrap;
          border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s; flex-shrink: 0;
        }
        .cl-tab:hover { color: var(--t1); }
        .cl-tab.on { color: var(--brand1); border-bottom-color: var(--brand1); font-weight: 700; }

        /* Stat mini-cards */
        .cl-stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-bottom: 10px; }
        .cl-stat { background: var(--bg2); border: 1px solid var(--b0); border-radius: 7px; padding: 7px 9px; text-align: center; }
        .cl-stat-l { font-size: 9px; color: var(--t4); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; }
        .cl-stat-v { font-size: 15px; font-weight: 800; font-family: var(--fd); color: var(--t1); }

        /* Filters */
        .cl-filters { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px; }
        @media (min-width: 520px) { .cl-filters { grid-template-columns: 1fr 1fr; } }

        /* Client list */
        .cl-card {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 10px; overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05); margin-bottom: 10px;
          transition: box-shadow 0.15s;
        }
        .cl-card:hover { box-shadow: 0 3px 12px rgba(201,168,76,0.1); }
        .cl-card-top { display: flex; align-items: flex-start; gap: 12px; padding: 14px; cursor: pointer; }
        .cl-card-body { padding: 0 14px 14px; }
        .cl-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .cl-bar-label { font-size: 10px; color: var(--t3); width: 75px; flex-shrink: 0; }
        .cl-bar-wrap  { flex: 1; height: 5px; background: var(--b0); border-radius: 3px; overflow: hidden; }
        .cl-bar-fill  { height: 100%; border-radius: 3px; }
        .cl-bar-val   { font-size: 11px; font-weight: 700; color: var(--t1); width: 30px; text-align: right; flex-shrink: 0; }
        .cl-actions   { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .cl-detail-section { padding-top: 10px; }
      `}</style>

      {/* ── EDIT MODAL ── */}
      {showEditClient && editForm && (
        <div className="overlay" onClick={() => setShowEditClient(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Edit Client — {editForm.name}</div>
            <div className="g2">
              <div className="field"><label>Full Name *</label>
                <input className="fi" value={editForm.name || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field"><label>Email</label>
                <input className="fi" type="email" value={editForm.email || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Gender</label>
                <select className="fi" value={editForm.gender || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Age</label>
                <input className="fi" type="number" value={editForm.age || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, age: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Assign Trainer *</label>
                <select className="fi" value={editForm.trainerId || ""} onChange={(e) => {
                  const t = trainers.find((tr) => tr.id === e.target.value);
                  setEditForm((p: any) => ({ ...p, trainerId: e.target.value, trainerName: t?.name || "" }));
                }}>
                  <option value="">Select trainer...</option>
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Program Type</label>
                <select className="fi" value={editForm.programType || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, programType: e.target.value }))}>
                  <option>1-on-1</option><option>Couple</option><option>Online</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Start Date</label>
                <input className="fi" type="date" value={editForm.startDate || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="field"><label>End Date</label>
                <input className="fi" type="date" value={editForm.endDate || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Sessions Included</label>
                <input className="fi" type="number" value={editForm.sessionsIncluded || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, sessionsIncluded: Number(e.target.value) }))} />
              </div>
              <div className="field"><label>Sessions Logged</label>
                <input className="fi" type="number" value={editForm.sessionsLogged || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, sessionsLogged: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Plan Name</label>
                <input className="fi" value={editForm.plan || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, plan: e.target.value }))} />
              </div>
              <div className="field"><label>Location</label>
                <input className="fi" value={editForm.location || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <div className="field"><label>Status</label>
              <select className="fi" value={editForm.status || "Active"} onChange={(e) => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                <option>Active</option><option>On Hold</option><option>Inactive</option>
              </select>
            </div>
            <div className="field"><label>Medical Notes</label>
              <textarea className="fi" rows={2} value={editForm.medicalNotes || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, medicalNotes: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="row mt16 gap8">
              <button className="btn btn-g btn-s" onClick={() => setShowEditClient(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={saveEditClient}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="sh">
        <div className="sh-l">
          <h2>Client Oversight</h2>
          <p>{filteredClients.length} clients — tap a card to expand</p>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {atRiskClients.length > 0 && (
        <div className="alert al-r mb12">
          🚨 {atRiskClients.length} at-risk client{atRiskClients.length > 1 ? "s" : ""} — expired, low sessions, or low compliance.
        </div>
      )}
      {expiredClients.length > 0 && (
        <div className="alert al-y mb8">
          📅 {expiredClients.length} plan{expiredClients.length > 1 ? "s" : ""} expired: {expiredClients.map((c) => c.name).join(", ")}
        </div>
      )}

      {/* ── SUMMARY STATS ── */}
      <div className="g4 mb16">
        {[
          { l: "Total",        v: clients.length,                                      c: "var(--blue)"   },
          { l: "Active",       v: clients.filter((c) => c.status === "Active").length, c: "var(--green)"  },
          { l: "At Risk",      v: atRiskClients.length,                                c: "var(--red)"    },
          { l: "Low Sessions", v: lowClassClients.length,                              c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="stat">
            <div className="stat-l">{s.l}</div>
            <div className="stat-v" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="cl-filters">
        <input className="fi" placeholder="🔍 Search clients or trainers..."
          value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
        <select className="fi" value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
          <option value="all">All Trainers</option>
          {trainers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
      <div className="tabs mb16">
        {[{ v: "all", l: "All" }, { v: "active", l: "Active" }, { v: "inactive", l: "Inactive" }].map((opt) => (
          <div key={opt.v} className={`tab ${clientStatusFilter === opt.v ? "on" : ""}`}
            onClick={() => setClientStatusFilter(opt.v)}>{opt.l}
          </div>
        ))}
      </div>

      {/* ── CLIENT CARDS ── */}
      {filteredClients.length === 0 && (
        <div className="alert al-b" style={{ textAlign: "center" }}>No clients match your filters.</div>
      )}

      {filteredClients.map((c) => {
        const isExpanded = expandedClient === c.id;
        const tab        = getTab(c.id);

        return (
          <div key={c.id} className="cl-card">

            {/* ── TOP ROW ── */}
            <div className="cl-card-top" onClick={() => setExpandedClient(isExpanded ? null : c.id)}>
              <div className="av av-a" style={{ width: 38, height: 38, fontSize: 12, flexShrink: 0 }}>
                {(c.name || "?").split(" ").map((n: string) => n[0] || "").join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row gap8" style={{ flexWrap: "wrap", marginBottom: 3 }}>
                  <span className="fs14 fw7 t1">{c.name}</span>
                  <span className={`badge fs10 ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span>
                  {(c.classesLeft || 0) <= 2 && <span className="badge br fs10">⚠ Low</span>}
                  {c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive" && <span className="badge br fs10">Expired</span>}
                </div>
                <div className="fs11 t3">
                  {c.trainerName} · {c.programType} · {c.location || "—"}
                </div>
              </div>
              <div style={{
                fontSize: 18, color: "var(--t3)", flexShrink: 0,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}>⌄</div>
            </div>

            {/* ── EXPANDED CONTENT ── */}
            {isExpanded && (
              <div className="cl-card-body">
                <div className="cl-tabs">
                  {[
                    { id: "overview", label: "Overview"   },
                    { id: "progress", label: "📊 Progress" },
                  ].map((t) => (
                    <div key={t.id} className={`cl-tab ${tab === t.id ? "on" : ""}`}
                      onClick={() => setTab(c.id, t.id)}>
                      {t.label}
                    </div>
                  ))}
                </div>

                {/* ── OVERVIEW TAB ── */}
                {tab === "overview" && (
                  <div className="cl-detail-section">
                    <div className="cl-stat-row" style={{ marginTop: 12 }}>
                      <div className="cl-stat">
                        <div className="cl-stat-l">Sessions</div>
                        {/* ✅ FIX 9: Always use current c.sessionsLogged (not stale value) */}
                        <div className="cl-stat-v">{c.sessionsLogged || 0}/{c.sessionsIncluded || 0}</div>
                      </div>
                      <div className="cl-stat">
                        <div className="cl-stat-l">Left</div>
                        {/* ✅ FIX 10: Recalculate classes left */}
                        <div className="cl-stat-v" style={{ color: (c.classesLeft || 0) <= 2 ? "var(--red)" : "var(--t1)" }}>
                          {Math.max(0, (c.sessionsIncluded || 0) - (c.sessionsLogged || 0))}
                        </div>
                      </div>
                      <div className="cl-stat">
                        <div className="cl-stat-l">Compliance</div>
                        {/* ✅ FIX 11: Recalculate compliance percentage */}
                        <div className="cl-stat-v" style={{ color: (c.compliance || 0) >= 85 ? "var(--green)" : (c.compliance || 0) >= 70 ? "var(--yellow)" : "var(--red)" }}>
                          {c.sessionsIncluded ? Math.round(((c.sessionsLogged || 0) / (c.sessionsIncluded || 0)) * 100) : 0}%
                        </div>
                      </div>
                      <div className="cl-stat">
                        <div className="cl-stat-l">Missed</div>
                        <div className="cl-stat-v" style={{ color: (c.missedSessions || 0) > 3 ? "var(--red)" : "var(--t1)" }}>
                          {c.missedSessions || 0}
                        </div>
                      </div>
                    </div>
                    <div className="cl-bar-row">
                      <div className="cl-bar-label">Compliance</div>
                      {/* ✅ FIX 12: Use recalculated compliance */}
                      <div className="cl-bar-wrap">
                        <div className="cl-bar-fill" style={{
                          width: `${c.sessionsIncluded ? Math.round(((c.sessionsLogged || 0) / (c.sessionsIncluded || 0)) * 100) : 0}%`,
                          background: (c.compliance || 0) >= 85 ? "var(--green)" : (c.compliance || 0) >= 70 ? "var(--yellow)" : "var(--red)",
                        }} />
                      </div>
                      <div className="cl-bar-val">{c.sessionsIncluded ? Math.round(((c.sessionsLogged || 0) / (c.sessionsIncluded || 0)) * 100) : 0}%</div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginBottom: 8 }}>
                      {c.plan      && <span className="fs11 t3">📋 {c.plan}</span>}
                      {c.startDate && <span className="fs11 t3">▶ {c.startDate}</span>}
                      {c.endDate   && <span className="fs11 t3">⏹ {c.endDate}</span>}
                      {c.age       && <span className="fs11 t3">🎂 Age {c.age}</span>}
                      {c.gender    && <span className="fs11 t3">{c.gender}</span>}
                    </div>
                    {c.medicalNotes && (
                      <div className="alert al-y" style={{ fontSize: 11, marginBottom: 8 }}>🏥 {c.medicalNotes}</div>
                    )}
                    <div className="cl-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-g btn-xs" onClick={() => setDetailClient(c)}>👁 Full View</button>
                      <button className="btn btn-g btn-xs" onClick={() => openEditClient(c)}>✏️ Edit</button>
                      {((c.classesLeft || 0) <= 2 || (c.endDate && new Date(c.endDate) < new Date())) && (
                        <button className="btn btn-warn btn-xs" onClick={() => openRenewClient(c)}>🔄 Renew</button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── PROGRESS TAB ── */}
                {tab === "progress" && (
                  <ProgressTab clientId={c.id} clientName={c.name} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
