"use client";
// ============================================================
// CLIENT DETAIL — FULL PAGE
// Shared by both Admin and Trainer portals.
// Props: clientId, trainerId, role ("admin"|"trainer"), onBack
// Tabs: Overview · Progress · Nutrition · Habits · Sessions
// ============================================================
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, where,
} from "firebase/firestore";

// ── tiny sparkline chart (no external dep) ──────────────────
function Spark({ data, color = "var(--brand)", height = 48 }: { data: number[]; color?: string; height?: number }) {
  if (!data || data.length < 2) return <div style={{ height, background: "var(--s2)", borderRadius: 6 }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const w = 300, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}

// ── stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, delta, deltaGood, color = "var(--brand)" }: any) {
  return (
    <div style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: "12px 14px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "4px 0 0 4px" }} />
      <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: deltaGood ? "var(--green)" : "var(--red)" }}>
          {deltaGood ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}

// ── section header ────────────────────────────────────────────
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      {action}
    </div>
  );
}

// ── log form ──────────────────────────────────────────────────
function LogForm({ fields, onSave, saving, saved, title }: {
  fields: { key: string; label: string; type?: string; step?: string; placeholder?: string; options?: string[] }[];
  onSave: (vals: Record<string, any>) => Promise<void>;
  saving: boolean; saved: boolean; title: string;
}) {
  const init = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [vals, setVals] = useState<Record<string, any>>(init);
  const set = (k: string, v: any) => setVals((p) => ({ ...p, [k]: v }));
  const handleSave = async () => { await onSave(vals); setVals(init); };
  return (
    <div style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>{f.label}</div>
            {f.options ? (
              <select className="fi" value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input className="fi" type={f.type || "number"} step={f.step} placeholder={f.placeholder || "0"} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      <button className="btn btn-p btn-s" style={{ width: "100%", marginTop: 12 }} onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Entry"}
      </button>
      {saved && <div className="alert al-g mt8">✓ Saved!</div>}
    </div>
  );
}

// ── history table ─────────────────────────────────────────────
function HistoryTable({ rows, cols }: { rows: any[]; cols: { key: string; label: string; format?: (v: any) => string }[] }) {
  if (!rows.length) return <div style={{ fontSize: 12, color: "var(--t3)", padding: "8px 0" }}>No entries yet.</div>;
  return (
    <div className="tw" style={{ marginTop: 8 }}>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {cols.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice().reverse().map((r, i) => (
            <tr key={i}>
              <td className="fw6">{r.date}</td>
              {cols.map((c) => <td key={c.key}>{c.format ? c.format(r[c.key]) : (r[c.key] ?? "—")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ClientDetail({
  client, role, loggerName, loggerUid, onBack,
}: {
  client: any;
  role: "admin" | "trainer";
  loggerName: string;
  loggerUid: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // ── live data ──
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [dietLogs, setDietLogs]         = useState<any[]>([]);
  const [sessionLogs, setSessionLogs]   = useState<any[]>([]);

  // ── form states ──
  const [savingWeight, setSavingWeight]         = useState(false);
  const [savedWeight, setSavedWeight]           = useState(false);
  const [savingMeasure, setSavingMeasure]       = useState(false);
  const [savedMeasure, setSavedMeasure]         = useState(false);
  const [savingStrength, setSavingStrength]     = useState(false);
  const [savedStrength, setSavedStrength]       = useState(false);
  const [savingNutrition, setSavingNutrition]   = useState(false);
  const [savedNutrition, setSavedNutrition]     = useState(false);
  const [savingHabits, setSavingHabits]         = useState(false);
  const [savedHabits, setSavedHabits]           = useState(false);

  const todayLabel = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // ── Firestore listeners ──
  useEffect(() => {
    if (!client?.id) return;

    // Progress logs — filtered by clientId for accuracy
    const unsubP = onSnapshot(
      query(
        collection(db, "progressLogs"),
        where("clientId", "==", client.id),
        orderBy("createdAt", "asc")
      ),
      (snap) => setProgressLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("progressLogs:", err)
    );

    // Diet logs — filtered by clientId
    const unsubD = onSnapshot(
      query(
        collection(db, "dietLogs"),
        where("clientId", "==", client.id),
        orderBy("createdAt", "asc")
      ),
      (snap) => setDietLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("dietLogs:", err)
    );

    // Session logs — filtered by clientId
    const unsubS = onSnapshot(
      query(
        collection(db, "sessionLogs"),
        where("clientId", "==", client.id),
        orderBy("createdAt", "desc")
      ),
      (snap) => setSessionLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("sessionLogs:", err)
    );

    return () => { unsubP(); unsubD(); unsubS(); };
  }, [client?.id]);

  // ── split progress logs by type ──
  const weightLogs   = progressLogs.filter((p) => p.type === "weight");
  const measureLogs  = progressLogs.filter((p) => p.type === "measurements");
  const strengthLogs = progressLogs.filter((p) => p.type === "strength");

  // ── split diet logs by type ──
  const nutritionLogs = dietLogs.filter((d) => d.type === "nutrition");
  const habitLogs     = dietLogs.filter((d) => d.type === "habits");

  // ── save helpers ──
  const saveProgressLog = async (type: string, data: Record<string, any>, setSaving: any, setSaved: any) => {
    setSaving(true);
    try {
      await addDoc(collection(db, "progressLogs"), {
        clientId: client.id,
        clientName: client.name,
        trainerId: client.trainerId,
        trainer: loggerName,
        loggedBy: loggerUid,
        type,
        date: todayLabel,
        ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Number(v) || 0])),
        createdAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const saveDietLog = async (type: string, data: Record<string, any>, setSaving: any, setSaved: any) => {
    setSaving(true);
    try {
      const processed = Object.fromEntries(
        Object.entries(data).map(([k, v]) =>
          typeof v === "string" && !isNaN(Number(v)) && v !== "" ? [k, Number(v)] : [k, v]
        )
      );
      await addDoc(collection(db, "dietLogs"), {
        clientId: client.id,
        clientName: client.name,
        trainerId: client.trainerId,
        trainer: loggerName,
        loggedBy: loggerUid,
        type,
        date: todayLabel,
        ...processed,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ── tab helpers ──
  const TABS = [
    { id: "overview",   label: "Overview" },
    { id: "progress",   label: "Progress" },
    { id: "nutrition",  label: "Nutrition" },
    { id: "habits",     label: "Habits" },
    { id: "sessions",   label: "Sessions" },
  ];

  // ── latest entries ──
  const latestWeight   = weightLogs[weightLogs.length - 1];
  const firstWeight    = weightLogs[0];
  const latestMeasure  = measureLogs[measureLogs.length - 1];
  const latestStrength = strengthLogs[strengthLogs.length - 1];
  const latestNutrition = nutritionLogs[nutritionLogs.length - 1];
  const latestHabits    = habitLogs[habitLogs.length - 1];

  return (
    <div style={{ minHeight: "100%", paddingBottom: 80 }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button className="btn btn-g btn-s" onClick={onBack}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div className="av av-c" style={{ width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>
            {(client.name || "?").split(" ").map((n: string) => n[0] || "").join("")}
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
      </div>

      {/* ── TABS ── */}
      <div className="tabs mb16" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
        {TABS.map((t) => (
          <div key={t.id} className={`tab ${activeTab === t.id ? "on" : ""}`} onClick={() => setActiveTab(t.id)}
            style={{ whiteSpace: "nowrap" }}>
            {t.label}
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          TAB: OVERVIEW
      ════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div>
          {client.medicalNotes && (
            <div className="alert al-y mb12">🩹 Medical: {client.medicalNotes}</div>
          )}
          {(client.classesLeft || 0) <= 2 && (
            <div className="alert al-r mb12">⚠ Only {client.classesLeft || 0} sessions remaining — needs renewal.</div>
          )}

          {/* Sessions stats */}
          <SectionHead title="Session Stats" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
            <StatCard label="Sessions Done" value={`${client.sessionsLogged || 0}/${client.sessionsIncluded || 0}`} color="var(--blue)" />
            <StatCard label="Classes Left" value={client.classesLeft || 0} color={(client.classesLeft || 0) <= 2 ? "var(--red)" : "var(--green)"} />
            <StatCard label="Compliance" value={`${client.compliance || 0}%`} color="var(--brand)" />
            <StatCard label="Missed" value={client.missedSessions || 0} color="var(--yellow)" />
          </div>

          {/* Latest weight */}
          {latestWeight && (
            <>
              <SectionHead title="Latest Weight" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                <StatCard label="Current Weight" value={`${latestWeight.weight}kg`}
                  sub={firstWeight ? `Started: ${firstWeight.weight}kg` : undefined}
                  delta={firstWeight ? `${Math.abs(latestWeight.weight - firstWeight.weight).toFixed(1)}kg ${latestWeight.weight < firstWeight.weight ? "lost" : "gained"}` : undefined}
                  deltaGood={firstWeight ? latestWeight.weight <= firstWeight.weight : true}
                  color="var(--brand)" />
                <StatCard label="Body Fat" value={`${latestWeight.bf}%`} color="var(--purple)" />
              </div>
            </>
          )}

          {/* Latest habits */}
          {latestHabits && (
            <>
              <SectionHead title="Latest Habits" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                <StatCard label="Steps" value={(latestHabits.steps || 0).toLocaleString()} color="var(--green)" />
                <StatCard label="Sleep" value={`${latestHabits.sleep}h`} color="var(--purple)" />
              </div>
            </>
          )}

          {/* Plan info */}
          <SectionHead title="Plan Info" />
          <div style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: 14 }}>
            {[
              ["Plan",        client.plan || "—"],
              ["Start Date",  client.startDate || "—"],
              ["End Date",    client.endDate || "—"],
              ["Last Session",client.lastSession || "—"],
              ["Email",       client.email || "—"],
              ["Gender",      client.gender || "—"],
              ["Age",         client.age || "—"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--b1)", fontSize: 13 }}>
                <span style={{ color: "var(--t3)" }}>{l}</span>
                <span style={{ fontWeight: 600, color: "var(--t1)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: PROGRESS
      ════════════════════════════════════════════ */}
      {activeTab === "progress" && (
        <div>

          {/* ── WEIGHT & BODY FAT ── */}
          <SectionHead title="⚖️ Weight & Body Fat" />

          {weightLogs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
              <StatCard label="Current Weight" value={`${latestWeight.weight}kg`}
                sub={`Start: ${firstWeight?.weight}kg`}
                delta={firstWeight ? `${Math.abs(latestWeight.weight - firstWeight.weight).toFixed(1)}kg` : undefined}
                deltaGood={firstWeight ? latestWeight.weight <= firstWeight.weight : true}
                color="var(--brand)" />
              <StatCard label="Body Fat" value={`${latestWeight.bf}%`}
                delta={firstWeight ? `${Math.abs(latestWeight.bf - firstWeight.bf).toFixed(1)}%` : undefined}
                deltaGood={firstWeight ? latestWeight.bf <= firstWeight.bf : true}
                color="var(--purple)" />
            </div>
          )}

          {weightLogs.length >= 2 && (
            <div className="card mb12">
              <div className="ch"><span className="ct">Weight Trend (kg)</span></div>
              <Spark data={weightLogs.map((p) => p.weight)} color="var(--brand)" height={64} />
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "var(--t3)" }}>Body Fat: <b style={{ color: "var(--purple)" }}>{latestWeight?.bf}%</b></span>
              </div>
            </div>
          )}

          <LogForm
            title="Log Weight Entry"
            fields={[
              { key: "weight", label: "Weight (kg)", placeholder: "e.g. 72.5" },
              { key: "bf",     label: "Body Fat %",  placeholder: "e.g. 18" },
            ]}
            onSave={(vals) => saveProgressLog("weight", vals, setSavingWeight, setSavedWeight)}
            saving={savingWeight} saved={savedWeight}
          />

          <HistoryTable
            rows={weightLogs}
            cols={[
              { key: "weight", label: "Weight (kg)" },
              { key: "bf",     label: "Body Fat %" },
            ]}
          />

          <div style={{ height: 1, background: "var(--b1)", margin: "24px 0" }} />

          {/* ── MEASUREMENTS ── */}
          <SectionHead title="📏 Body Measurements" />

          {measureLogs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
              {[
                { l: "Chest",  k: "chest",  c: "var(--brand)" },
                { l: "Waist",  k: "waist",  c: "var(--blue)" },
                { l: "Hips",   k: "hips",   c: "var(--purple)" },
                { l: "Arms",   k: "arms",   c: "var(--green)" },
                { l: "Thighs", k: "thighs", c: "var(--yellow)" },
              ].map((m) => {
                const first = measureLogs[0];
                const last  = measureLogs[measureLogs.length - 1];
                const delta = last[m.k] - first[m.k];
                const good  = m.k === "arms" ? delta > 0 : delta < 0;
                return (
                  <StatCard key={m.k} label={m.l} value={`${last[m.k]}cm`}
                    delta={`${delta > 0 ? "+" : ""}${delta}cm`}
                    deltaGood={good} color={m.c} />
                );
              })}
            </div>
          )}

          {measureLogs.length >= 2 && (
            <div className="card mb12">
              <div className="ch"><span className="ct">Waist Trend (cm)</span></div>
              <Spark data={measureLogs.map((p) => p.waist)} color="var(--blue)" height={56} />
            </div>
          )}

          <LogForm
            title="Log Measurements"
            fields={[
              { key: "chest",  label: "Chest (cm)" },
              { key: "waist",  label: "Waist (cm)" },
              { key: "hips",   label: "Hips (cm)" },
              { key: "arms",   label: "Arms (cm)" },
              { key: "thighs", label: "Thighs (cm)" },
            ]}
            onSave={(vals) => saveProgressLog("measurements", vals, setSavingMeasure, setSavedMeasure)}
            saving={savingMeasure} saved={savedMeasure}
          />

          <HistoryTable
            rows={measureLogs}
            cols={[
              { key: "chest",  label: "Chest" },
              { key: "waist",  label: "Waist" },
              { key: "hips",   label: "Hips" },
              { key: "arms",   label: "Arms" },
              { key: "thighs", label: "Thighs" },
            ]}
          />

          <div style={{ height: 1, background: "var(--b1)", margin: "24px 0" }} />

          {/* ── STRENGTH ── */}
          <SectionHead title="💪 Strength Progress" />

          {strengthLogs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { l: "Squat",    k: "squat",    c: "var(--green)",  unit: "kg" },
                { l: "Bench",    k: "bench",    c: "var(--brand)",  unit: "kg" },
                { l: "Deadlift", k: "deadlift", c: "var(--purple)", unit: "kg" },
                { l: "Push-ups", k: "pushup",   c: "var(--blue)",   unit: "reps" },
                { l: "Plank",    k: "plank",    c: "var(--yellow)", unit: "sec" },
              ].map((m) => {
                const first = strengthLogs[0];
                const last  = strengthLogs[strengthLogs.length - 1];
                const delta = (last[m.k] || 0) - (first[m.k] || 0);
                return (
                  <StatCard key={m.k} label={m.l}
                    value={`${last[m.k] || 0}${m.unit}`}
                    sub={`Start: ${first[m.k] || 0}${m.unit}`}
                    delta={`${delta > 0 ? "+" : ""}${delta}${m.unit}`}
                    deltaGood={delta >= 0}
                    color={m.c} />
                );
              })}
            </div>
          )}

          {strengthLogs.length >= 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { l: "Squat",    k: "squat",    c: "var(--green)" },
                { l: "Deadlift", k: "deadlift", c: "var(--purple)" },
              ].map((m) => (
                <div key={m.k} className="card">
                  <div className="ch"><span className="ct" style={{ fontSize: 12 }}>{m.l} (kg)</span></div>
                  <Spark data={strengthLogs.map((p) => p[m.k] || 0)} color={m.c} height={48} />
                </div>
              ))}
            </div>
          )}

          <LogForm
            title="Log Strength"
            fields={[
              { key: "squat",    label: "Squat (kg)" },
              { key: "bench",    label: "Bench (kg)" },
              { key: "deadlift", label: "Deadlift (kg)" },
              { key: "pushup",   label: "Push-ups (reps)" },
              { key: "plank",    label: "Plank (sec)" },
            ]}
            onSave={(vals) => saveProgressLog("strength", vals, setSavingStrength, setSavedStrength)}
            saving={savingStrength} saved={savedStrength}
          />

          <HistoryTable
            rows={strengthLogs}
            cols={[
              { key: "squat",    label: "Squat" },
              { key: "bench",    label: "Bench" },
              { key: "deadlift", label: "Deadlift" },
              { key: "pushup",   label: "Push-ups" },
              { key: "plank",    label: "Plank (s)" },
            ]}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: NUTRITION
      ════════════════════════════════════════════ */}
      {activeTab === "nutrition" && (
        <div>
          <SectionHead title="🥩 Nutrition Tracking" />

          {nutritionLogs.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
                {(() => {
                  const avg = (k: string) =>
                    Math.round(nutritionLogs.reduce((s, d) => s + (d[k] || 0), 0) / nutritionLogs.length);
                  return [
                    { l: "Avg Protein", v: `${avg("protein")}g`,  target: "120g",  pct: Math.round(avg("protein") / 120 * 100), c: "var(--brand)" },
                    { l: "Avg Water",   v: `${(nutritionLogs.reduce((s,d)=>s+(d.water||0),0)/nutritionLogs.length).toFixed(1)}L`, target: "3L", pct: 0, c: "var(--blue)" },
                    { l: "Avg Calories",v: `${avg("calories")}`,   target: "—",     pct: 0, c: "var(--green)" },
                  ].map((s) => <StatCard key={s.l} label={s.l} value={s.v} sub={`Target: ${s.target}`} color={s.c} />);
                })()}
              </div>

              {nutritionLogs.length >= 2 && (
                <div className="card mb12">
                  <div className="ch"><span className="ct">Protein Trend (g)</span></div>
                  <Spark data={nutritionLogs.map((d) => d.protein || 0)} color="var(--brand)" height={56} />
                </div>
              )}
            </>
          )}

          <LogForm
            title="Log Nutrition"
            fields={[
              { key: "protein",  label: "Protein (g)",  placeholder: "e.g. 120" },
              { key: "calories", label: "Calories",      placeholder: "e.g. 2000" },
              { key: "water",    label: "Water (L)",     placeholder: "e.g. 3", step: "0.1" },
              { key: "carbs",    label: "Carbs (g)",     placeholder: "e.g. 200" },
              { key: "fats",     label: "Fats (g)",      placeholder: "e.g. 60" },
            ]}
            onSave={(vals) => saveDietLog("nutrition", vals, setSavingNutrition, setSavedNutrition)}
            saving={savingNutrition} saved={savedNutrition}
          />

          <HistoryTable
            rows={nutritionLogs}
            cols={[
              { key: "protein",  label: "Protein (g)" },
              { key: "calories", label: "Calories" },
              { key: "water",    label: "Water (L)" },
              { key: "carbs",    label: "Carbs (g)" },
              { key: "fats",     label: "Fats (g)" },
            ]}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: HABITS
      ════════════════════════════════════════════ */}
      {activeTab === "habits" && (
        <div>
          <SectionHead title="🔁 Daily Habits" />

          {habitLogs.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 }}>
                {(() => {
                  const avg = (k: string) =>
                    Math.round(habitLogs.reduce((s, d) => s + (Number(d[k]) || 0), 0) / habitLogs.length);
                  return [
                    { l: "Avg Steps", v: avg("steps").toLocaleString(), c: "var(--green)" },
                    { l: "Avg Sleep", v: `${(habitLogs.reduce((s,d)=>s+(d.sleep||0),0)/habitLogs.length).toFixed(1)}h`, c: "var(--purple)" },
                  ].map((s) => <StatCard key={s.l} label={s.l} value={s.v} color={s.c} />);
                })()}
              </div>

              {habitLogs.length >= 2 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 }}>
                  <div className="card">
                    <div className="ch"><span className="ct" style={{ fontSize: 12 }}>Steps Trend</span></div>
                    <Spark data={habitLogs.map((d) => d.steps || 0)} color="var(--green)" height={48} />
                  </div>
                  <div className="card">
                    <div className="ch"><span className="ct" style={{ fontSize: 12 }}>Sleep (hrs)</span></div>
                    <Spark data={habitLogs.map((d) => d.sleep || 0)} color="var(--purple)" height={48} />
                  </div>
                </div>
              )}

              {/* Sleep quality breakdown */}
              <div className="card mb12">
                <div className="ch"><span className="ct">Sleep Quality</span></div>
                {["Great", "Good", "Average", "Poor"].map((q) => {
                  const count = habitLogs.filter((d) => d.sleepQuality === q).length;
                  const pct   = habitLogs.length ? Math.round((count / habitLogs.length) * 100) : 0;
                  const color = q === "Great" ? "var(--green)" : q === "Good" ? "var(--blue)" : q === "Average" ? "var(--yellow)" : "var(--red)";
                  return (
                    <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--t2)", width: 60 }}>{q}</span>
                      <div style={{ flex: 1, height: 8, background: "var(--s3)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--t3)", width: 36, textAlign: "right" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Trainer insights */}
              <div className="card mb12">
                <div className="ch"><span className="ct">Insights</span><span className="badge bb fs10">Auto</span></div>
                {habitLogs.length > 0 && (() => {
                  const avgSteps = Math.round(habitLogs.reduce((s, d) => s + (d.steps || 0), 0) / habitLogs.length);
                  const avgSleep = habitLogs.reduce((s, d) => s + (d.sleep || 0), 0) / habitLogs.length;
                  return (
                    <div className="col gap8">
                      {avgSteps < 7000  && <div className="alert al-y">🚶 Avg steps {avgSteps.toLocaleString()} — below 7k target.</div>}
                      {avgSteps >= 10000 && <div className="alert al-g">✓ Consistently hitting 10k+ steps.</div>}
                      {avgSleep < 7     && <div className="alert al-r">😴 Avg sleep {avgSleep.toFixed(1)}h — below 7h minimum.</div>}
                      {avgSleep >= 7.5  && <div className="alert al-g">✓ Sleep quality good — averaging {avgSleep.toFixed(1)}h.</div>}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          <LogForm
            title="Log Habits"
            fields={[
              { key: "steps",        label: "Steps",         placeholder: "e.g. 8000" },
              { key: "sleep",        label: "Sleep (hours)", placeholder: "e.g. 7.5", step: "0.5" },
              { key: "sleepQuality", label: "Sleep Quality", options: ["Great", "Good", "Average", "Poor"] },
              { key: "activeMinutes",label: "Active Minutes",placeholder: "e.g. 45" },
            ]}
            onSave={(vals) => saveDietLog("habits", vals, setSavingHabits, setSavedHabits)}
            saving={savingHabits} saved={savedHabits}
          />

          <HistoryTable
            rows={habitLogs}
            cols={[
              { key: "steps",        label: "Steps",   format: (v) => (v || 0).toLocaleString() },
              { key: "sleep",        label: "Sleep" },
              { key: "sleepQuality", label: "Quality" },
              { key: "activeMinutes",label: "Active (min)" },
            ]}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: SESSIONS
      ════════════════════════════════════════════ */}
      {activeTab === "sessions" && (
        <div>
          <SectionHead title="📝 Session History" />
          {sessionLogs.length === 0 && (
            <div className="alert al-b">No sessions logged yet for this client.</div>
          )}
          <div className="col gap10">
            {sessionLogs.map((s) => (
              <div key={s.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{s.date}</span>
                      <span className={`badge fs10 ${s.status === "completed" ? "bg" : "br"}`}>{s.status}</span>
                      {s.late && <span className="badge br fs10">⏰ Late</span>}
                      {s.injuryFlag && <span className="badge br fs10">🩹 {s.injuryFlag}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 4 }}>
                      {s.type} · {s.duration}min · by {s.trainer}
                    </div>
                    {s.notes && <div style={{ fontSize: 12, color: "var(--t2)" }}>{s.notes}</div>}
                  </div>
                </div>

                {/* Exercises */}
                {s.exercises && s.exercises.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--b1)" }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Exercises</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {s.exercises.map((ex: any, i: number) => (
                        <div key={i} style={{ display: "flex", gap: 8, fontSize: 12 }}>
                          <span style={{ color: "var(--t1)", fontWeight: 600, flex: 1 }}>{ex.name}</span>
                          <span style={{ color: "var(--t3)" }}>{ex.sets}×{ex.reps} @ {ex.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition + Habits logged with session */}
                {(s.steps || s.water || s.sleep) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--b1)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {s.steps && <div style={{ fontSize: 11, color: "var(--t3)" }}>👟 {(s.steps).toLocaleString()} steps</div>}
                    {s.water && <div style={{ fontSize: 11, color: "var(--t3)" }}>💧 {s.water}L water</div>}
                    {s.sleep && <div style={{ fontSize: 11, color: "var(--t3)" }}>😴 {s.sleep}h sleep</div>}
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
