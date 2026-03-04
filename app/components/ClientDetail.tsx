"use client";
// ============================================================
// CLIENT DETAIL — FULL PAGE
// v5 — All saves write to progressLogs in unified format
//      so admin Clients.tsx ProgressTab picks up data instantly.
//      Warm white + gold theme. Firebase persists on refresh.
// ============================================================
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp, where,
} from "firebase/firestore";

const n = (v: any): number => Number(v) || 0;

// ── Sparkline ─────────────────────────────────────────────────
function Spark({ data, color = "var(--brand1)", height = 48 }: { data: number[]; color?: string; height?: number }) {
  const safe = data.map((v) => n(v));
  if (safe.length < 2) return <div style={{ height, background: "var(--bg3)", borderRadius: 6 }} />;
  const min = Math.min(...safe), max = Math.max(...safe);
  const range = max - min || 1;
  const w = 300, h = height;
  const pts = safe.map((v, i) => `${(i / (safe.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.1" stroke="none" />
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, delta, deltaGood, color = "var(--brand1)" }: any) {
  return (
    <div style={{
      background: "var(--bg1)", border: "1px solid var(--b0)",
      borderRadius: 10, padding: "12px 14px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 3, height: "100%", background: color,
        borderRadius: "4px 0 0 4px",
      }} />
      <div style={{ fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", color, lineHeight: 1 }}>{value}</div>
      {sub   && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 3 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: deltaGood ? "var(--green)" : "var(--red)" }}>
          {deltaGood ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}

// ── Section head ──────────────────────────────────────────────
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, marginTop: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      {action}
    </div>
  );
}

// ── Log form ──────────────────────────────────────────────────
function LogForm({ fields, onSave, saving, saved, title }: {
  fields: { key: string; label: string; type?: string; step?: string; placeholder?: string; options?: string[] }[];
  onSave: (vals: Record<string, any>) => Promise<void>;
  saving: boolean; saved: boolean; title: string;
}) {
  const init = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [vals, setVals] = useState<Record<string, any>>(init);
  const [open, setOpen] = useState(false);
  const set = (k: string, v: any) => setVals((p) => ({ ...p, [k]: v }));
  const handleSave = async () => { await onSave(vals); setVals(init); setOpen(false); };

  return (
    <div style={{ marginBottom: 12 }}>
      {!open ? (
        <button className="btn btn-g btn-s" style={{ width: "100%" }} onClick={() => setOpen(true)}>
          + {title}
        </button>
      ) : (
        <div style={{
          background: "var(--bg2)", border: "1.5px solid var(--brand1)",
          borderRadius: 10, padding: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{title}</div>
            <button className="btn btn-g btn-xs" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {fields.map((f) => (
              <div key={f.key}>
                <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
                {f.options ? (
                  <select className="fi" value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="fi" type={f.type || "number"} step={f.step}
                    placeholder={f.placeholder || "0"} value={vals[f.key]}
                    onChange={(e) => set(f.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-p btn-s" style={{ width: "100%", marginTop: 12 }} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "✓ Save Entry"}
          </button>
          {saved && <div className="alert al-g mt8 fs11">✓ Saved to Firebase — visible in Progress tab instantly</div>}
        </div>
      )}
    </div>
  );
}

// ── History table ─────────────────────────────────────────────
function HistoryTable({ rows, cols }: { rows: any[]; cols: { key: string; label: string; format?: (v: any) => string }[] }) {
  const [show, setShow] = useState(false);
  if (!rows.length) return <div style={{ fontSize: 12, color: "var(--t3)", padding: "8px 0" }}>No entries yet.</div>;
  const display = show ? [...rows].reverse() : [...rows].reverse().slice(0, 5);
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              {cols.map((c) => <th key={c.key}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {display.map((r, i) => (
              <tr key={i}>
                <td className="fw6">{r.date || "—"}</td>
                {cols.map((c) => <td key={c.key}>{c.format ? c.format(r[c.key]) : (r[c.key] ?? "—")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 5 && (
        <button className="btn btn-g btn-xs mt8" onClick={() => setShow(!show)}>
          {show ? "Show less" : `Show all ${rows.length} entries`}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ClientDetail({
  client, role, loggerName, loggerUid, onBack,
}: {
  client: any; role: "admin" | "trainer";
  loggerName: string; loggerUid: string; onBack: () => void;
}) {
  const [activeTab, setActiveTab]       = useState("overview");
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [dietLogs, setDietLogs]         = useState<any[]>([]);
  const [sessionLogs, setSessionLogs]   = useState<any[]>([]);
  const [dataLoading, setDataLoading]   = useState(true);

  // saving states
  const [savingWeight,    setSavingWeight]    = useState(false);
  const [savedWeight,     setSavedWeight]     = useState(false);
  const [savingMeasure,   setSavingMeasure]   = useState(false);
  const [savedMeasure,    setSavedMeasure]    = useState(false);
  const [savingStrength,  setSavingStrength]  = useState(false);
  const [savedStrength,   setSavedStrength]   = useState(false);
  const [savingNutrition, setSavingNutrition] = useState(false);
  const [savedNutrition,  setSavedNutrition]  = useState(false);
  const [savingHabits,    setSavingHabits]    = useState(false);
  const [savedHabits,     setSavedHabits]     = useState(false);

  const todayLabel = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // ── Firebase listeners ────────────────────────────────────────
  useEffect(() => {
    if (!client) return;
    setDataLoading(true);
    let loaded = 0;
    const checkLoaded = () => { if (++loaded >= 3) setDataLoading(false); };
    const hasId = !!client.id;

    const progressQ = hasId
      ? query(collection(db, "progressLogs"), where("clientId", "==", client.id), orderBy("createdAt", "asc"))
      : query(collection(db, "progressLogs"), where("clientName", "==", client.name), orderBy("createdAt", "asc"));

    const dietQ = hasId
      ? query(collection(db, "dietLogs"), where("clientId", "==", client.id), orderBy("createdAt", "asc"))
      : query(collection(db, "dietLogs"), where("clientName", "==", client.name), orderBy("createdAt", "asc"));

    const sessionQ = hasId
      ? query(collection(db, "sessionLogs"), where("clientId", "==", client.id), orderBy("createdAt", "desc"))
      : query(collection(db, "sessionLogs"), where("client", "==", client.name), orderBy("createdAt", "desc"));

    const unsubP = onSnapshot(progressQ,
      (snap) => { setProgressLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); checkLoaded(); },
      (err)  => { console.error("progressLogs:", err); checkLoaded(); }
    );
    const unsubD = onSnapshot(dietQ,
      (snap) => { setDietLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); checkLoaded(); },
      (err)  => { console.error("dietLogs:", err); checkLoaded(); }
    );
    const unsubS = onSnapshot(sessionQ,
      (snap) => { setSessionLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); checkLoaded(); },
      (err)  => { console.error("sessionLogs:", err); checkLoaded(); }
    );
    return () => { unsubP(); unsubD(); unsubS(); };
  }, [client?.id, client?.name]);

  // ── Split logs by type ────────────────────────────────────────
  const weightLogs    = progressLogs.filter((p) => p.type === "weight"       || (!p.type && p.weight && !p.chest));
  const measureLogs   = progressLogs.filter((p) => p.type === "measurements" || (!p.type && p.chest));
  const strengthLogs  = progressLogs.filter((p) => p.type === "strength"     || (!p.type && p.squat));
  const nutritionLogs = dietLogs.filter((d) => d.type === "nutrition" || (!d.type && d.protein && !d.steps));
  const habitLogs     = dietLogs.filter((d) => d.type === "habits"    || (!d.type && d.steps));

  // session-sourced progress (from trainer LogSession)
  const sessionProgressLogs = progressLogs.filter((p) => p.source === "session_log");

  const latestWeight   = weightLogs[weightLogs.length - 1];
  const firstWeight    = weightLogs[0];
  const latestMeasure  = measureLogs[measureLogs.length - 1];
  const firstMeasure   = measureLogs[0];
  const latestStrength = strengthLogs[strengthLogs.length - 1];
  const firstStrength  = strengthLogs[0];
  const latestHabits   = habitLogs[habitLogs.length - 1];

  // ── Save helpers ──────────────────────────────────────────────
  // Writes to BOTH progressLogs (for admin Clients.tsx ProgressTab)
  // AND the specific collection for ClientDetail tabs
  const saveProgressLog = async (
    type: string,
    data: Record<string, any>,
    setSaving: any,
    setSaved: any,
    extraFields?: Record<string, any>
  ) => {
    setSaving(true);
    try {
      const numData = Object.fromEntries(
        Object.entries(data).map(([k, v]) =>
          typeof v === "string" && v !== "" && !isNaN(Number(v)) ? [k, Number(v)] : [k, v]
        )
      );
      const entry = {
        clientId:   client.id   || "",
        clientName: client.name || "",
        trainerId:  client.trainerId || "",
        loggedBy:   loggerName,
        source:     role === "admin" ? "admin_manual" : "trainer_manual",
        type,
        date:       todayLabel,
        ...numData,
        ...(extraFields || {}),
        createdAt:  serverTimestamp(),
      };
      // Write to progressLogs — admin Clients.tsx ProgressTab reads this
      await addDoc(collection(db, "progressLogs"), entry);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error("saveProgressLog:", e); }
    finally { setSaving(false); }
  };

  const saveDietLog = async (
    type: string,
    data: Record<string, any>,
    setSaving: any,
    setSaved: any
  ) => {
    setSaving(true);
    try {
      const processed = Object.fromEntries(
        Object.entries(data).map(([k, v]) =>
          typeof v === "string" && v !== "" && !isNaN(Number(v)) ? [k, Number(v)] : [k, v]
        )
      );
      const entry = {
        clientId:   client.id   || "",
        clientName: client.name || "",
        trainerId:  client.trainerId || "",
        loggedBy:   loggerName,
        source:     role === "admin" ? "admin_manual" : "trainer_manual",
        type,
        date:       todayLabel,
        ...processed,
        createdAt:  serverTimestamp(),
      };
      // Write to dietLogs for Habits/Nutrition tabs
      await addDoc(collection(db, "dietLogs"), entry);
      // ALSO write to progressLogs so admin Clients.tsx ProgressTab sees it
      await addDoc(collection(db, "progressLogs"), entry);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error("saveDietLog:", e); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: "overview",  label: "Overview"  },
    { id: "progress",  label: "📊 Progress" },
    { id: "nutrition", label: "🥗 Nutrition" },
    { id: "habits",    label: "💤 Habits"  },
    { id: "sessions",  label: "📝 Sessions" },
  ];

  if (dataLoading) return (
    <div style={{ padding: 24 }}>
      <button className="btn btn-g btn-s" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>
      <div className="alert al-b">Loading {client?.name}'s data...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button className="btn btn-g btn-s" onClick={onBack}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div className="av av-a" style={{ width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>
            {(client.name || "?").split(" ").map((n: string) => n[0] || "").join("").slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--t1)" }}>{client.name}</div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              {client.programType} · {client.location || "—"} · {client.trainerName}
            </div>
          </div>
        </div>
        <span className={`badge ${client.status === "Active" ? "bg" : client.status === "On Hold" ? "by" : "br"}`}>
          {client.status}
        </span>
        {role === "admin" && (
          <span className="badge bgr fs10">👑 Admin View</span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
        {TABS.map((t) => (
          <div key={t.id} className={`tab ${activeTab === t.id ? "on" : ""}`}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* ══════════════ OVERVIEW ══════════════ */}
      {activeTab === "overview" && (
        <div>
          {client.medicalNotes && (
            <div className="alert al-y mb12">🩹 Medical: {client.medicalNotes}</div>
          )}
          {(client.classesLeft || 0) <= 2 && (
            <div className="alert al-r mb12">⚠ Only {client.classesLeft || 0} sessions remaining — needs renewal.</div>
          )}

          <SectionHead title="Session Stats" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
            <StatCard label="Sessions Done" value={`${n(client.sessionsLogged)}/${n(client.sessionsIncluded)}`} color="var(--blue)" />
            <StatCard label="Classes Left"  value={n(client.classesLeft)} color={(client.classesLeft || 0) <= 2 ? "var(--red)" : "var(--green)"} />
            <StatCard label="Compliance"    value={`${n(client.compliance)}%`} color="var(--brand1)" />
            <StatCard label="Missed"        value={n(client.missedSessions)} color="var(--yellow)" />
          </div>

          {latestWeight && (
            <>
              <SectionHead title="Latest Weight" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
                <StatCard label="Current Weight" value={`${n(latestWeight.weight)}kg`}
                  sub={firstWeight ? `Started: ${n(firstWeight.weight)}kg` : undefined}
                  delta={firstWeight ? `${Math.abs(n(latestWeight.weight) - n(firstWeight.weight)).toFixed(1)}kg ${n(latestWeight.weight) < n(firstWeight.weight) ? "lost" : "gained"}` : undefined}
                  deltaGood={firstWeight ? n(latestWeight.weight) <= n(firstWeight.weight) : true}
                  color="var(--brand1)" />
                <StatCard label="Body Fat" value={`${n(latestWeight.bf)}%`} color="var(--purple)" />
              </div>
            </>
          )}

          {/* Session-sourced progress summary */}
          {sessionProgressLogs.length > 0 && (
            <>
              <SectionHead title="From Trainer Sessions" />
              <div className="alert al-b fs11 mb12">
                📊 {sessionProgressLogs.length} progress entr{sessionProgressLogs.length === 1 ? "y" : "ies"} logged by trainer during sessions.
                Go to <strong>Progress</strong> tab to see full breakdown.
              </div>
            </>
          )}

          {latestHabits && (
            <>
              <SectionHead title="Latest Habits" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
                <StatCard label="Steps" value={n(latestHabits.steps).toLocaleString()} color="var(--green)" />
                <StatCard label="Sleep" value={`${n(latestHabits.sleep)}h`} color="var(--purple)" />
              </div>
            </>
          )}

          <SectionHead title="Plan Info" />
          <div style={{ background: "var(--bg2)", border: "1px solid var(--b0)", borderRadius: 10, padding: 14 }}>
            {[
              ["Plan",         client.plan        || "—"],
              ["Start Date",   client.startDate   || "—"],
              ["End Date",     client.endDate     || "—"],
              ["Last Session", client.lastSession || "—"],
              ["Email",        client.email       || "—"],
              ["Gender",       client.gender      || "—"],
              ["Age",          client.age         || "—"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--b0)", fontSize: 13 }}>
                <span style={{ color: "var(--t3)" }}>{l}</span>
                <span style={{ fontWeight: 600, color: "var(--t1)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ PROGRESS ══════════════ */}
      {activeTab === "progress" && (
        <div>

          {/* Source badge */}
          {sessionProgressLogs.length > 0 && (
            <div className="alert al-g mb12 fs11">
              ✓ Includes {sessionProgressLogs.length} entr{sessionProgressLogs.length === 1 ? "y" : "ies"} from trainer session logs
            </div>
          )}

          {/* Weight & Body Fat */}
          <SectionHead title="⚖️ Weight & Body Fat" />
          {weightLogs.length > 0 && latestWeight && firstWeight && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
              <StatCard label="Current Weight" value={`${n(latestWeight.weight)}kg`}
                sub={`Start: ${n(firstWeight.weight)}kg`}
                delta={`${Math.abs(n(latestWeight.weight) - n(firstWeight.weight)).toFixed(1)}kg`}
                deltaGood={n(latestWeight.weight) <= n(firstWeight.weight)} color="var(--brand1)" />
              <StatCard label="Body Fat" value={`${n(latestWeight.bf)}%`}
                delta={firstWeight ? `${Math.abs(n(latestWeight.bf) - n(firstWeight.bf)).toFixed(1)}%` : undefined}
                deltaGood={n(latestWeight.bf) <= n(firstWeight.bf)} color="var(--purple)" />
            </div>
          )}
          {weightLogs.length >= 2 && (
            <div className="card mb12">
              <div className="ch"><span className="ct">Weight Trend (kg)</span></div>
              <Spark data={weightLogs.map((p) => n(p.weight))} color="var(--brand1)" height={64} />
            </div>
          )}
          <LogForm title="Log Weight Entry"
            fields={[
              { key: "weight", label: "Weight (kg)", placeholder: "e.g. 72.5", step: "0.1" },
              { key: "bf",     label: "Body Fat %",  placeholder: "e.g. 18",   step: "0.1" },
            ]}
            onSave={(vals) => saveProgressLog("weight", vals, setSavingWeight, setSavedWeight)}
            saving={savingWeight} saved={savedWeight}
          />
          <HistoryTable rows={weightLogs} cols={[
            { key: "weight",  label: "Weight (kg)" },
            { key: "bf",      label: "Body Fat %" },
            { key: "loggedBy", label: "By" },
          ]} />

          <div style={{ height: 1, background: "var(--b0)", margin: "24px 0" }} />

          {/* Measurements */}
          <SectionHead title="📏 Body Measurements" />
          {measureLogs.length > 0 && latestMeasure && firstMeasure && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 12 }}>
              {[
                { l: "Chest",  k: "chest",  c: "var(--brand1)" },
                { l: "Waist",  k: "waist",  c: "var(--blue)"   },
                { l: "Hips",   k: "hips",   c: "var(--purple)" },
                { l: "Arms",   k: "arms",   c: "var(--green)"  },
                { l: "Thighs", k: "thighs", c: "var(--yellow)" },
              ].map((m) => {
                const delta = n(latestMeasure[m.k]) - n(firstMeasure[m.k]);
                const good  = m.k === "arms" ? delta > 0 : delta < 0;
                return (
                  <StatCard key={m.k} label={m.l} value={`${n(latestMeasure[m.k])}cm`}
                    delta={`${delta > 0 ? "+" : ""}${delta}cm`} deltaGood={good} color={m.c} />
                );
              })}
            </div>
          )}
          {measureLogs.length >= 2 && (
            <div className="card mb12">
              <div className="ch"><span className="ct">Waist Trend (cm)</span></div>
              <Spark data={measureLogs.map((p) => n(p.waist))} color="var(--blue)" height={56} />
            </div>
          )}
          <LogForm title="Log Measurements"
            fields={[
              { key: "chest",  label: "Chest (cm)",   step: "0.5" },
              { key: "waist",  label: "Waist (cm)",   step: "0.5" },
              { key: "hips",   label: "Hips (cm)",    step: "0.5" },
              { key: "arms",   label: "Arms (cm)",    step: "0.5" },
              { key: "thighs", label: "Thighs (cm)",  step: "0.5" },
            ]}
            onSave={(vals) => saveProgressLog("measurements", vals, setSavingMeasure, setSavedMeasure)}
            saving={savingMeasure} saved={savedMeasure}
          />
          <HistoryTable rows={measureLogs} cols={[
            { key: "chest",   label: "Chest"  },
            { key: "waist",   label: "Waist"  },
            { key: "hips",    label: "Hips"   },
            { key: "arms",    label: "Arms"   },
            { key: "thighs",  label: "Thighs" },
            { key: "loggedBy", label: "By"    },
          ]} />

          <div style={{ height: 1, background: "var(--b0)", margin: "24px 0" }} />

          {/* Strength */}
          <SectionHead title="💪 Strength Progress" />
          {strengthLogs.length > 0 && latestStrength && firstStrength && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { l: "Squat",    k: "squat",    c: "var(--green)",  u: "kg"   },
                { l: "Bench",    k: "bench",    c: "var(--brand1)", u: "kg"   },
                { l: "Deadlift", k: "deadlift", c: "var(--purple)", u: "kg"   },
                { l: "Push-ups", k: "pushup",   c: "var(--blue)",   u: "reps" },
                { l: "Plank",    k: "plank",    c: "var(--yellow)", u: "sec"  },
              ].map((m) => {
                const delta = n(latestStrength[m.k]) - n(firstStrength[m.k]);
                return (
                  <StatCard key={m.k} label={m.l}
                    value={`${n(latestStrength[m.k])}${m.u}`}
                    sub={`Start: ${n(firstStrength[m.k])}${m.u}`}
                    delta={`${delta > 0 ? "+" : ""}${delta}${m.u}`}
                    deltaGood={delta >= 0} color={m.c} />
                );
              })}
            </div>
          )}
          {strengthLogs.length >= 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { l: "Squat",    k: "squat",    c: "var(--green)"  },
                { l: "Deadlift", k: "deadlift", c: "var(--purple)" },
              ].map((m) => (
                <div key={m.k} className="card">
                  <div className="ch"><span className="ct" style={{ fontSize: 12 }}>{m.l} (kg)</span></div>
                  <Spark data={strengthLogs.map((p) => n(p[m.k]))} color={m.c} height={48} />
                </div>
              ))}
            </div>
          )}
          <LogForm title="Log Strength"
            fields={[
              { key: "squat",    label: "Squat (kg)"       },
              { key: "bench",    label: "Bench (kg)"       },
              { key: "deadlift", label: "Deadlift (kg)"    },
              { key: "pushup",   label: "Push-ups (reps)"  },
              { key: "plank",    label: "Plank (sec)"      },
            ]}
            onSave={(vals) => saveProgressLog("strength", vals, setSavingStrength, setSavedStrength)}
            saving={savingStrength} saved={savedStrength}
          />
          <HistoryTable rows={strengthLogs} cols={[
            { key: "squat",    label: "Squat"     },
            { key: "bench",    label: "Bench"     },
            { key: "deadlift", label: "Deadlift"  },
            { key: "pushup",   label: "Push-ups"  },
            { key: "plank",    label: "Plank (s)" },
            { key: "loggedBy", label: "By"        },
          ]} />
        </div>
      )}

      {/* ══════════════ NUTRITION ══════════════ */}
      {activeTab === "nutrition" && (
        <div>
          <SectionHead title="🥩 Nutrition Tracking" />
          {nutritionLogs.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
                <StatCard label="Avg Protein"  value={`${Math.round(nutritionLogs.reduce((s,d)=>s+n(d.protein),0)/nutritionLogs.length)}g`}  sub="daily avg"    color="var(--brand1)" />
                <StatCard label="Avg Water"    value={`${(nutritionLogs.reduce((s,d)=>s+n(d.water),0)/nutritionLogs.length).toFixed(1)}L`}    sub="daily avg"    color="var(--blue)"   />
                <StatCard label="Avg Calories" value={`${Math.round(nutritionLogs.reduce((s,d)=>s+n(d.calories),0)/nutritionLogs.length)}`}   sub="kcal"         color="var(--green)"  />
                <StatCard label="Avg Carbs"    value={`${Math.round(nutritionLogs.reduce((s,d)=>s+n(d.carbs),0)/nutritionLogs.length)}g`}     sub="carbs"        color="var(--yellow)" />
              </div>
              {nutritionLogs.length >= 2 && (
                <div className="card mb12">
                  <div className="ch"><span className="ct">Protein Trend (g)</span></div>
                  <Spark data={nutritionLogs.map((d) => n(d.protein))} color="var(--brand1)" height={56} />
                </div>
              )}
            </>
          )}
          {nutritionLogs.length === 0 && <div className="alert al-b mb12">No nutrition logs yet.</div>}
          <LogForm title="Log Nutrition"
            fields={[
              { key: "protein",  label: "Protein (g)",  placeholder: "e.g. 120"  },
              { key: "calories", label: "Calories",      placeholder: "e.g. 2000" },
              { key: "water",    label: "Water (L)",     placeholder: "e.g. 3",   step: "0.1" },
              { key: "carbs",    label: "Carbs (g)",     placeholder: "e.g. 200"  },
              { key: "fats",     label: "Fats (g)",      placeholder: "e.g. 60"   },
            ]}
            onSave={(vals) => saveDietLog("nutrition", vals, setSavingNutrition, setSavedNutrition)}
            saving={savingNutrition} saved={savedNutrition}
          />
          <HistoryTable rows={nutritionLogs} cols={[
            { key: "protein",  label: "Protein (g)" },
            { key: "calories", label: "Calories"    },
            { key: "water",    label: "Water (L)"   },
            { key: "carbs",    label: "Carbs (g)"   },
            { key: "fats",     label: "Fats (g)"    },
            { key: "loggedBy", label: "By"          },
          ]} />
        </div>
      )}

      {/* ══════════════ HABITS ══════════════ */}
      {activeTab === "habits" && (
        <div>
          <SectionHead title="🔁 Daily Habits" />
          {habitLogs.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
                <StatCard label="Avg Steps" value={Math.round(habitLogs.reduce((s,d)=>s+n(d.steps),0)/habitLogs.length).toLocaleString()} color="var(--green)"  />
                <StatCard label="Avg Sleep" value={`${(habitLogs.reduce((s,d)=>s+n(d.sleep),0)/habitLogs.length).toFixed(1)}h`}           color="var(--purple)" />
              </div>
              {habitLogs.length >= 2 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
                  <div className="card">
                    <div className="ch"><span className="ct" style={{ fontSize: 12 }}>Steps Trend</span></div>
                    <Spark data={habitLogs.map((d) => n(d.steps))} color="var(--green)" height={48} />
                  </div>
                  <div className="card">
                    <div className="ch"><span className="ct" style={{ fontSize: 12 }}>Sleep (hrs)</span></div>
                    <Spark data={habitLogs.map((d) => n(d.sleep))} color="var(--purple)" height={48} />
                  </div>
                </div>
              )}
              {/* Sleep quality bars */}
              <div className="card mb12">
                <div className="ch"><span className="ct">Sleep Quality</span></div>
                {["Great","Good","Average","Poor"].map((q) => {
                  const count = habitLogs.filter((d) => d.sleepQuality === q).length;
                  const pct   = habitLogs.length ? Math.round((count / habitLogs.length) * 100) : 0;
                  const color = q === "Great" ? "var(--green)" : q === "Good" ? "var(--blue)" : q === "Average" ? "var(--yellow)" : "var(--red)";
                  return (
                    <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--t2)", width: 60 }}>{q}</span>
                      <div style={{ flex: 1, height: 8, background: "var(--b0)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--t3)", width: 36, textAlign: "right" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
              {/* Auto insights */}
              <div className="card mb12">
                <div className="ch"><span className="ct">Insights</span><span className="badge bb fs10">Auto</span></div>
                {(() => {
                  const avgSteps = Math.round(habitLogs.reduce((s,d)=>s+n(d.steps),0)/habitLogs.length);
                  const avgSleep = habitLogs.reduce((s,d)=>s+n(d.sleep),0)/habitLogs.length;
                  return (
                    <div className="col gap8">
                      {avgSteps < 7000   && <div className="alert al-y fs11">🚶 Avg steps {avgSteps.toLocaleString()} — below 7k target.</div>}
                      {avgSteps >= 10000 && <div className="alert al-g fs11">✓ Consistently hitting 10k+ steps.</div>}
                      {avgSleep < 7      && <div className="alert al-r fs11">😴 Avg sleep {avgSleep.toFixed(1)}h — below 7h minimum.</div>}
                      {avgSleep >= 7.5   && <div className="alert al-g fs11">✓ Sleep quality good — averaging {avgSleep.toFixed(1)}h.</div>}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
          {habitLogs.length === 0 && <div className="alert al-b mb12">No habit logs yet.</div>}
          <LogForm title="Log Habits"
            fields={[
              { key: "steps",         label: "Steps",          placeholder: "e.g. 8000" },
              { key: "sleep",         label: "Sleep (hours)",  placeholder: "e.g. 7.5", step: "0.5" },
              { key: "sleepQuality",  label: "Sleep Quality",  options: ["Great","Good","Average","Poor"] },
              { key: "activeMinutes", label: "Active Minutes", placeholder: "e.g. 45" },
            ]}
            onSave={(vals) => saveDietLog("habits", vals, setSavingHabits, setSavedHabits)}
            saving={savingHabits} saved={savedHabits}
          />
          <HistoryTable rows={habitLogs} cols={[
            { key: "steps",         label: "Steps",       format: (v) => n(v).toLocaleString() },
            { key: "sleep",         label: "Sleep"        },
            { key: "sleepQuality",  label: "Quality"      },
            { key: "activeMinutes", label: "Active (min)" },
            { key: "loggedBy",      label: "By"           },
          ]} />
        </div>
      )}

      {/* ══════════════ SESSIONS ══════════════ */}
      {activeTab === "sessions" && (
        <div>
          <SectionHead title="📝 Session History" />
          {sessionLogs.length === 0 && <div className="alert al-b">No sessions logged yet.</div>}
          <div className="col gap10">
            {sessionLogs.map((s) => (
              <div key={s.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{s.date}</span>
                      <span className={`badge fs10 ${s.status === "completed" ? "bg" : "br"}`}>{s.status}</span>
                      {s.late      && <span className="badge by fs10">⏰ Late</span>}
                      {s.injuryFlag && <span className="badge br fs10">🩹 {s.injuryFlag}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 4 }}>
                      {s.type} · {s.duration}min · by {s.trainer}
                    </div>
                    {s.notes && <div style={{ fontSize: 12, color: "var(--t2)" }}>{s.notes}</div>}
                  </div>
                </div>
                {s.exercises && s.exercises.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--b0)" }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Exercises</div>
                    {s.exercises.map((ex: any, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: "var(--t1)", fontWeight: 600, flex: 1 }}>{ex.name}</span>
                        <span style={{ color: "var(--t3)" }}>{ex.sets}×{ex.reps} @ {ex.weight}kg</span>
                      </div>
                    ))}
                  </div>
                )}
                {(s.steps || s.water || s.sleep) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--b0)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {s.steps && <span style={{ fontSize: 11, color: "var(--t3)" }}>👟 {n(s.steps).toLocaleString()} steps</span>}
                    {s.water && <span style={{ fontSize: 11, color: "var(--t3)" }}>💧 {s.water}L water</span>}
                    {s.sleep && <span style={{ fontSize: 11, color: "var(--t3)" }}>😴 {s.sleep}h sleep</span>}
                    {s.weight && <span style={{ fontSize: 11, color: "var(--t3)" }}>⚖️ {s.weight}kg</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
