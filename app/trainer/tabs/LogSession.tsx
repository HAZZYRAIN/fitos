"use client";
import { useState, useEffect } from "react";
import { useTrainer } from "../TrainerContext";
import { WORKOUT_LIBRARY } from "../../data/workoutLibrary";
import { db } from "../../../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// ── Types ─────────────────────────────────────────────────────
type HabitKey = "steps" | "water" | "sleep" | "sleepQuality" | "activeMinutes" | "protein" | "calories" | "carbs" | "fats";
type MeasurementKey = "weight" | "chest" | "waist" | "hips" | "arms";

interface ExSet { reps: string; load: string; }
interface LoggedEx { name: string; muscles: string; sets: ExSet[]; rpe: string; }

const blankSet    = (): ExSet    => ({ reps: "", load: "" });
const blankEx     = (name = "", muscles = ""): LoggedEx => ({
  name, muscles, sets: [blankSet(), blankSet(), blankSet()], rpe: "",
});

const ALL_CATS    = Object.keys(WORKOUT_LIBRARY);
const STEPS_CFG   = [
  { id: 1, label: "Client",    icon: "👤" },
  { id: 2, label: "Session",   icon: "📋" },
  { id: 3, label: "Exercises", icon: "🏋" },
  { id: 4, label: "Habits",    icon: "🔁" },
  { id: 5, label: "Submit",    icon: "✅" },
];

// ─────────────────────────────────────────────────────────────
export default function LogSession() {
  const {
    myClients, uid,
    logClient,        setLogClient,
    sessionDate,      setSessionDate,
    sessionDuration,  setSessionDuration,
    sessionStatus,    setSessionStatus,
    sessionType,      setSessionType,
    sessionNotes,     setSessionNotes,
    sessionModReason, setSessionModReason,
    injuryFlag,       setInjuryFlag,
    sessionHabits,    setSessionHabits,
    sessionMeasurements, setSessionMeasurements,
    sessionError, sessionLoading, sessionSaved,
    setSessionExercises,
    saveSession,
  } = useTrainer();

  // ── Local exercise state ──────────────────────────────────
  const [exercises, setExercises] = useState<LoggedEx[]>([]);

  // ── Stepper ───────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Picker bottom-sheet ───────────────────────────────────
  const [showPicker, setShowPicker]     = useState(false);
  const [pickerTab, setPickerTab]       = useState<"library"|"template"|"manual">("library");
  const [libCat, setLibCat]             = useState(ALL_CATS[0] || "Chest");
  const [libSearch, setLibSearch]       = useState("");
  const [manualName, setManualName]     = useState("");
  const [manualMuscle, setManualMuscle] = useState("");

  // ── Templates assigned to this trainer ───────────────────
  const [templates, setTemplates] = useState<any[]>([]);
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "templates"),
      where("status", "==", "active"),
      where("assignedTo", "array-contains", uid)
    );
    return onSnapshot(q, (snap) =>
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [uid]);

  // ── Sync exercises back to context before save ────────────
  // TrainerContext.saveSession reads sessionExercises
  useEffect(() => {
    setSessionExercises(
      exercises.map((ex) => ({
        name:       ex.name,
        muscles:    ex.muscles,
        // legacy flat fields (context still reads these)
        sets:       String(ex.sets.length),
        reps:       ex.sets.map((s) => s.reps || "0").join("/"),
        weight:     ex.sets.map((s) => s.load || "0").join("/"),
        rpe:        ex.rpe,
        // rich detail for Firestore
        setsDetail: ex.sets,
      }))
    );
  }, [exercises]);

  // ── Helpers ───────────────────────────────────────────────
  const getHabit       = (k: HabitKey)       => sessionHabits[k]       || "";
  const getMeasurement = (k: MeasurementKey) => sessionMeasurements[k] || "";
  const isMissing      = (k: string) =>
    !!sessionError && ["steps","water","sleep"].includes(k) && !sessionHabits[k as HabitKey];
  const hasMeasData    = Object.values(sessionMeasurements).some((v) => v !== "");
  const hasNutrition   = !!(sessionHabits.protein || sessionHabits.calories);
  const missingHabits  = (["steps","water","sleep"] as HabitKey[]).filter((k) => !sessionHabits[k]);
  const selectedClient = myClients.find((c) => c.name === logClient);

  // ── Exercise CRUD ─────────────────────────────────────────
  const addEx    = (name: string, muscles = "") => {
    setExercises((p) => [...p, blankEx(name, muscles)]);
    setShowPicker(false); setManualName(""); setManualMuscle(""); setLibSearch("");
  };
  const removeEx = (i: number)                       => setExercises((p) => p.filter((_, j) => j !== i));
  const updateSet= (ei: number, si: number, f: keyof ExSet, v: string) =>
    setExercises((p) => p.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [f]: v }),
    }));
  const addSet   = (ei: number) =>
    setExercises((p) => p.map((ex, i) => i !== ei ? ex : { ...ex, sets: [...ex.sets, blankSet()] }));
  const removeSet= (ei: number, si: number) =>
    setExercises((p) => p.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.filter((_, j) => j !== si),
    }));
  const setRpe   = (ei: number, v: string) =>
    setExercises((p) => p.map((ex, i) => i !== ei ? ex : { ...ex, rpe: v }));
  const loadTemplate = (t: any) => {
    addEx(`${t.name} — Exercise 1`, t.category || "");
  };

  // ── Library filtered list ─────────────────────────────────
  const libList = libSearch.trim()
    ? ALL_CATS.flatMap((cat) =>
        ((WORKOUT_LIBRARY as any)[cat] || [])
          .filter((e: any) =>
            e.name.toLowerCase().includes(libSearch.toLowerCase()) ||
            (e.muscles || "").toLowerCase().includes(libSearch.toLowerCase())
          )
          .map((e: any) => ({ ...e, _cat: cat }))
      )
    : ((WORKOUT_LIBRARY as any)[libCat] || []).map((e: any) => ({ ...e, _cat: libCat }));

  // ── Step nav ──────────────────────────────────────────────
  const canNext = (s: number) => {
    if (s === 1) return !!logClient;
    if (s === 2) return !!sessionNotes.trim();
    return true;
  };

  // ── RPE colour ────────────────────────────────────────────
  const rpeColor = (r: number) => r <= 4 ? "var(--green)" : r <= 7 ? "var(--yellow)" : "var(--red)";
  const rpeLabel = (r: number) => r <= 3 ? "Very easy" : r <= 5 ? "Moderate" : r <= 7 ? "Hard" : r <= 9 ? "Very hard" : "Max effort";

  return (
    <>
      <style>{`
        /* ── stepper ── */
        .wiz-bar{display:flex;align-items:center;gap:0;margin-bottom:20px;overflow-x:auto;padding-bottom:4px;}
        .wiz-bar::-webkit-scrollbar{height:3px;}
        .wiz-bar::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px;}
        .wiz-step{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;
          cursor:pointer;padding:4px 8px;border-radius:8px;border:none;background:none;font-family:inherit;}
        .wiz-step:hover{background:var(--bg3);}
        .wiz-circle{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;
          justify-content:center;font-size:12px;font-weight:700;border:2px solid var(--b1);
          background:var(--bg2);color:var(--t3);transition:all .15s;}
        .wiz-circle.done  {background:var(--green); border-color:var(--green); color:#fff;}
        .wiz-circle.active{background:var(--brand1);border-color:var(--brand1);color:#fff;}
        .wiz-lbl{font-size:9px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;}
        .wiz-lbl.active{color:var(--brand1);}
        .wiz-div{width:18px;height:2px;background:var(--b0);flex-shrink:0;margin:0 2px;margin-bottom:14px;}
        .wiz-div.done{background:var(--green);}

        /* ── step card ── */
        .wiz-card{background:var(--bg1);border:1px solid var(--b0);border-radius:12px;
          padding:18px 16px;box-shadow:0 1px 4px rgba(0,0,0,.05);overflow:hidden;}
        .wiz-title{font-size:15px;font-weight:800;color:var(--t1);margin-bottom:16px;
          display:flex;align-items:center;gap:8px;}

        /* ── exercise card ── */
        .ex-card{background:var(--bg2);border:1px solid var(--b0);border-radius:10px;
          padding:12px;margin-bottom:10px;}
        .ex-name{font-size:13px;font-weight:700;color:var(--t1);}
        .ex-muscle{font-size:10px;color:var(--t3);margin-top:1px;}

        /* ── set grid ── */
        /* ── set cards — big mobile inputs ── */
        .set-card{background:var(--bg1);border:1.5px solid var(--b0);border-radius:10px;padding:10px 12px;margin-bottom:8px;}
        .set-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .set-badge{font-size:10px;font-weight:800;color:var(--brand1);
          background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);
          border-radius:6px;padding:3px 10px;}
        .set-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .set-field-lbl{font-size:9px;font-weight:700;color:var(--t4);
          text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;text-align:center;}
        .set-big-inp{
          width:100%;box-sizing:border-box;height:52px;border-radius:8px;
          border:1.5px solid var(--b0);background:var(--bg2);
          font-size:22px;font-weight:800;font-family:var(--fd);
          color:var(--t1);text-align:center;padding:0 8px;outline:none;
          transition:border-color .15s;
          -moz-appearance:textfield;
        }
        .set-big-inp::-webkit-outer-spin-button,.set-big-inp::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .set-big-inp:focus{border-color:var(--brand1);background:var(--bg1);}
        .set-del{background:none;border:none;cursor:pointer;color:var(--t4);font-size:14px;
          padding:4px 6px;border-radius:6px;transition:color .12s,background .12s;line-height:1;}
        .set-del:hover{color:var(--red);background:rgba(192,57,43,.08);}
        .set-del:disabled{opacity:.25;cursor:default;}

        /* ── RPE ── */
        .rpe-row{display:flex;align-items:center;gap:4px;margin-top:10px;flex-wrap:wrap;row-gap:6px;}
        .rpe-lbl{font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-right:2px;flex-shrink:0;}
        .rpe-btn{width:36px;height:36px;border-radius:8px;border:1.5px solid var(--b1);flex-shrink:0;
          background:var(--bg1);font-size:12px;font-weight:700;cursor:pointer;color:var(--t3);
          transition:all .12s;display:flex;align-items:center;justify-content:center;}
        .rpe-btn.sel{border-color:var(--brand1);background:rgba(201,168,76,.12);color:var(--brand1);}

        /* ── picker overlay ── */
        .picker-ov{position:fixed;inset:0;background:rgba(20,15,5,.5);
          backdrop-filter:blur(4px);z-index:700;
          display:flex;align-items:flex-end;justify-content:center;}
        @media(min-width:640px){.picker-ov{align-items:center;}}
        .picker-sheet{background:var(--bg1);border-radius:16px 16px 0 0;
          width:100%;max-width:540px;max-height:88vh;
          display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 -4px 30px rgba(0,0,0,.15);}
        @media(min-width:640px){.picker-sheet{border-radius:16px;max-height:80vh;}}
        .picker-handle{width:36px;height:4px;border-radius:2px;background:var(--b1);margin:10px auto 0;flex-shrink:0;}
        .picker-head{display:flex;align-items:center;justify-content:space-between;
          padding:12px 16px 8px;flex-shrink:0;}
        .picker-tabs{display:flex;gap:4px;padding:0 16px 10px;
          flex-shrink:0;border-bottom:1px solid var(--b0);}
        .picker-body{flex:1;overflow-y:auto;padding:12px 16px;}
        .picker-body::-webkit-scrollbar{width:3px;}
        .picker-body::-webkit-scrollbar-thumb{background:var(--b1);border-radius:2px;}

        /* ── cat scroll ── */
        .cat-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;}
        .cat-scroll::-webkit-scrollbar{height:2px;}
        .cat-btn{font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;
          border:1px solid var(--b1);background:var(--bg2);color:var(--t3);
          cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .12s;}
        .cat-btn.on{background:rgba(201,168,76,.1);color:var(--brand1);border-color:rgba(201,168,76,.3);}

        /* ── lib exercise row ── */
        .lib-row{display:flex;align-items:center;gap:10px;padding:9px 10px;
          border-radius:8px;cursor:pointer;border:1px solid var(--b0);
          margin-bottom:6px;background:var(--bg2);transition:border-color .12s,background .12s;}
        .lib-row:hover{border-color:var(--brand1);background:var(--bg1);}

        /* ── template row ── */
        .tmpl-row{padding:11px 12px;border-radius:8px;cursor:pointer;
          border:1px solid var(--b0);margin-bottom:8px;
          background:var(--bg2);transition:border-color .12s;}
        .tmpl-row:hover{border-color:var(--brand1);}

        /* ── nav ── */
        .wiz-nav{display:flex;gap:10px;margin-top:20px;}

        /* ── summary ── */
        .sum-row{display:flex;justify-content:space-between;
          padding:7px 0;border-bottom:1px solid var(--b0);font-size:12px;}
        .sum-row:last-child{border:none;}

        /* ── section tag ── */
        .stag{font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;
          letter-spacing:.5px;text-transform:uppercase;}
        .stag-opt{background:rgba(184,134,11,.1);color:var(--yellow);border:1px solid rgba(184,134,11,.2);}
        .stag-req{background:rgba(192,57,43,.1); color:var(--red);  border:1px solid rgba(192,57,43,.15);}
      `}</style>

      {/* ── Page header ── */}
      <div className="sh" style={{ marginBottom: 16 }}>
        <div className="sh-l">
          <h2>Log Session</h2>
          <p>Step {step} of 5 — {STEPS_CFG[step - 1].label}</p>
        </div>
      </div>

      {/* ── Stepper bar ── */}
      <div className="wiz-bar">
        {STEPS_CFG.map((s, i) => (
          <span key={s.id} style={{ display: "contents" }}>
            <button
              className="wiz-step"
              onClick={() => { if (s.id < step || canNext(step)) setStep(s.id); }}
            >
              <div className={`wiz-circle ${step > s.id ? "done" : step === s.id ? "active" : ""}`}>
                {step > s.id ? "✓" : s.icon}
              </div>
              <div className={`wiz-lbl ${step === s.id ? "active" : ""}`}>{s.label}</div>
            </button>
            {i < STEPS_CFG.length - 1 && (
              <div className={`wiz-div ${step > s.id ? "done" : ""}`} />
            )}
          </span>
        ))}
      </div>

      {/* ══════════════════════════════════════
          STEP 1 — CLIENT
      ══════════════════════════════════════ */}
      {step === 1 && (
        <div className="wiz-card">
          <div className="wiz-title">👤 Select Client</div>

          <div className="field">
            <label>Client *</label>
            <select className="fi" value={logClient} onChange={(e) => setLogClient(e.target.value)}>
              <option value="">Select client...</option>
              {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>

          {selectedClient && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--b0)", borderRadius: 10, padding: 14, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div className="av av-a" style={{ width: 34, height: 34, fontSize: 11, flexShrink: 0 }}>
                  {selectedClient.name.split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="fs13 fw7 t1">{selectedClient.name}</div>
                  <div className="fs10 t3">{selectedClient.programType} · {selectedClient.location || "—"}</div>
                </div>
                <span className={`badge fs10 ${selectedClient.status === "Active" ? "bg" : "br"}`}>{selectedClient.status}</span>
              </div>
              {selectedClient.medicalNotes && <div className="alert al-y fs11 mb8">📌 {selectedClient.medicalNotes}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[
                  { l: "Sessions", v: `${selectedClient.sessionsLogged || 0}/${selectedClient.sessionsIncluded || 0}` },
                  { l: "Left",     v: selectedClient.classesLeft || 0, red: (selectedClient.classesLeft || 0) <= 3 },
                  { l: "Compliance", v: `${selectedClient.compliance || 0}%` },
                ].map((s) => (
                  <div key={s.l} style={{ background: "var(--bg1)", border: "1px solid var(--b0)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "var(--t4)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>{s.l}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--fd)", color: (s as any).red ? "var(--red)" : "var(--t1)" }}>{s.v}</div>
                  </div>
                ))}
              </div>
              {(selectedClient.classesLeft || 0) <= 2 && (
                <div className="alert al-r fs11 mt8">⚠ Only {selectedClient.classesLeft || 0} sessions left — inform admin.</div>
              )}
            </div>
          )}

          <div className="wiz-nav">
            <button className="btn btn-p" style={{ flex: 1 }} onClick={() => setStep(2)} disabled={!logClient}>
              Next: Session Details →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP 2 — SESSION DETAILS
      ══════════════════════════════════════ */}
      {step === 2 && (
        <div className="wiz-card">
          <div className="wiz-title">📋 Session Details</div>

          <div className="g2">
            <div className="field">
              <label>Date *</label>
              <input className="fi" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Duration (min)</label>
              <input className="fi" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Status *</label>
            <select className="fi" value={sessionStatus} onChange={(e) => setSessionStatus(e.target.value)}>
              <option>Completed</option>
              <option>Missed — Client No-Show</option>
              <option>Missed — Trainer Unavailable</option>
              <option>Modified (explain below)</option>
              <option>Cancelled by Client</option>
            </select>
          </div>

          <div className="field">
            <label>Session Type</label>
            <select className="fi" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
              <option>Strength Training</option><option>Cardio</option>
              <option>HIIT</option><option>Mobility</option>
              <option>Rehab</option><option>Mixed</option>
            </select>
          </div>

          <div className="field">
            <label>Quality Notes * <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span></label>
            <textarea
              className="fi" rows={4}
              placeholder="What went well? Technique issues? Client energy? Any key observations?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              style={{ resize: "none", borderColor: !sessionNotes.trim() && sessionError ? "var(--red)" : undefined }}
            />
          </div>

          {sessionStatus.toLowerCase().includes("modified") && (
            <div className="field">
              <label>Modification Reason *</label>
              <textarea className="fi" rows={2} placeholder="Why was it modified?"
                value={sessionModReason} onChange={(e) => setSessionModReason(e.target.value)} style={{ resize: "none" }} />
            </div>
          )}

          <div className="field">
            <label>Injury / Risk Flag</label>
            <select className="fi" value={injuryFlag} onChange={(e) => setInjuryFlag(e.target.value)}>
              <option value="">No issues</option>
              <option>Knee Pain</option><option>Back Pain</option><option>Shoulder Pain</option>
              <option>Dizziness</option><option>Medical Risk — Needs Review</option>
              <option>Client Requested Reduced Intensity</option>
            </select>
          </div>
          {injuryFlag && <div className="alert al-r fs11 mb4">⚠ Immediately visible to admin</div>}

          <div className="wiz-nav">
            <button className="btn btn-g" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-p" style={{ flex: 2 }} onClick={() => setStep(3)} disabled={!sessionNotes.trim()}>
              Next: Exercises →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP 3 — EXERCISES
      ══════════════════════════════════════ */}
      {step === 3 && (
        <div className="wiz-card">
          <div className="wiz-title">🏋 Exercises <span style={{ fontSize: 12, fontWeight: 500, color: "var(--t3)" }}>({exercises.length})</span></div>

          {exercises.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏋</div>
              <div className="fs13 fw6 t2">No exercises yet</div>
              <div className="fs11 t3 mt4">Add from library, template, or type manually</div>
            </div>
          )}

          {exercises.map((ex, ei) => (
            <div key={ei} className="ex-card">
              {/* Exercise header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="ex-name">{ex.name}</div>
                  {ex.muscles && <div className="ex-muscle">{ex.muscles}</div>}
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 16, padding: 2 }}
                  onClick={() => removeEx(ei)}>✕</button>
              </div>

              {/* Sets — scrollable table so it never overflows on mobile */}
              <div className="sets-wrap">
                <table className="set-table">
                  <thead>
                    <tr>
                      <th>Set</th>
                      <th>Reps</th>
                      <th>Load (kg)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((s, si) => (
                      <tr key={si}>
                        <td>{si + 1}</td>
              {/* Sets — big card per set for easy mobile input */}
              {ex.sets.map((s, si) => (
                <div key={si} className="set-card">
                  <div className="set-card-head">
                    <span className="set-badge">SET {si + 1}</span>
                    <button className="set-del" onClick={() => removeSet(ei, si)} disabled={ex.sets.length <= 1}>
                      Remove
                    </button>
                  </div>
                  <div className="set-fields">
                    <div>
                      <div className="set-field-lbl">Reps</div>
                      <input
                        className="set-big-inp" type="number" inputMode="numeric"
                        placeholder="10" value={s.reps}
                        onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="set-field-lbl">Load (kg)</div>
                      <input
                        className="set-big-inp" type="number" inputMode="decimal"
                        placeholder="0" step="0.5" value={s.load}
                        onChange={(e) => updateSet(ei, si, "load", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
                      borderColor: ex.rpe === String(r) ? rpeColor(r) : undefined,
                      background:  ex.rpe === String(r) ? `${rpeColor(r)}18` : undefined,
                    }}
                    onClick={() => setRpe(ei, String(r))}
                  >{r}</button>
                ))}
                {ex.rpe && (
                  <span style={{ fontSize: 10, color: rpeColor(Number(ex.rpe)), marginLeft: 4, fontWeight: 600 }}>
                    {rpeLabel(Number(ex.rpe))}
                  </span>
                )}
              </div>
            </div>
          ))}

          <button className="btn btn-p" style={{ width: "100%", marginTop: 4 }} onClick={() => setShowPicker(true)}>
            + Add Exercise
          </button>

          <div className="wiz-nav">
            <button className="btn btn-g" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-p" style={{ flex: 2 }} onClick={() => setStep(4)}>
              Next: Habits →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP 4 — HABITS & NUTRITION
      ══════════════════════════════════════ */}
      {step === 4 && (
        <div className="wiz-card">
          <div className="wiz-title">🔁 Habits & Nutrition</div>

          {/* Habits — required */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="fs12 fw7 t2">Daily Habits</span>
            <span className="stag stag-req">Required</span>
          </div>
          <div className="g2">
            {([
              { k: "steps",         l: "Step Count *",             p: "8000", st: undefined },
              { k: "water",         l: "Water Intake (L) *",       p: "2.5",  st: "0.1"    },
              { k: "sleep",         l: "Sleep Last Night (hrs) *", p: "7",    st: "0.5"    },
              { k: "activeMinutes", l: "Active Minutes",           p: "45",   st: undefined },
            ] as any[]).map(({ k, l, p, st }) => (
              <div key={k} className="field">
                <label>{l} {isMissing(k) && <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span>}</label>
                <input className="fi" type="number" step={st} placeholder={p}
                  value={getHabit(k as HabitKey)}
                  onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, [k]: e.target.value }))}
                  style={{ borderColor: isMissing(k) ? "var(--red)" : undefined }}
                />
              </div>
            ))}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Sleep Quality</label>
              <select className="fi" value={sessionHabits.sleepQuality || "Good"}
                onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, sleepQuality: e.target.value }))}>
                <option>Great</option><option>Good</option><option>Average</option><option>Poor</option>
              </select>
            </div>
          </div>

          {/* Measurements — optional */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 10px" }}>
            <span className="fs12 fw7 t2">📏 Body Measurements</span>
            <span className="stag stag-opt">Optional</span>
          </div>
          <div className="g2">
            {([
              { k: "weight", l: "Weight (kg)", p: "72.5" },
              { k: "chest",  l: "Chest (cm)",  p: "98"   },
              { k: "waist",  l: "Waist (cm)",  p: "82"   },
              { k: "hips",   l: "Hips (cm)",   p: "94"   },
              { k: "arms",   l: "Arms (cm)",   p: "34"   },
            ] as { k: MeasurementKey; l: string; p: string }[]).map(({ k, l, p }) => (
              <div key={k} className="field">
                <label>{l}</label>
                <input className="fi" type="number" step="0.1" placeholder={p}
                  value={getMeasurement(k)}
                  onChange={(e) => setSessionMeasurements((prev: any) => ({ ...prev, [k]: e.target.value }))}
                  style={{ borderColor: getMeasurement(k) ? "var(--brand1)" : undefined }}
                />
              </div>
            ))}
          </div>
          {hasMeasData && <div className="alert al-g fs11 mt8">✓ Measurements saved to client progress tab</div>}

          {/* Nutrition — optional */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 10px" }}>
            <span className="fs12 fw7 t2">🥩 Nutrition</span>
            <span className="stag stag-opt">Optional</span>
          </div>
          <div className="g2">
            {([
              { k: "protein",  l: "Protein (g)",  p: "120"  },
              { k: "calories", l: "Calories",      p: "2000" },
              { k: "carbs",    l: "Carbs (g)",     p: "200"  },
              { k: "fats",     l: "Fats (g)",      p: "60"   },
            ] as any[]).map(({ k, l, p }) => (
              <div key={k} className="field">
                <label>{l}</label>
                <input className="fi" type="number" placeholder={p}
                  value={getHabit(k as HabitKey)}
                  onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, [k]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {missingHabits.length > 0 && (
            <div className="alert al-y mt12 fs11">
              📋 Still needed: {missingHabits.map((k) =>
                ({ steps: "Step Count", water: "Water Intake", sleep: "Sleep" } as any)[k]
              ).join(", ")}
            </div>
          )}

          <div className="wiz-nav">
            <button className="btn btn-g" style={{ flex: 1 }} onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-p" style={{ flex: 2 }} onClick={() => setStep(5)}>
              Review & Submit →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP 5 — REVIEW & SUBMIT
      ══════════════════════════════════════ */}
      {step === 5 && (
        <div className="wiz-card">
          <div className="wiz-title">✅ Review & Submit</div>

          {/* Summary box */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--b0)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div className="sum-row"><span className="t3">Client</span>      <span className="fw7 t1">{logClient || "—"}</span></div>
            <div className="sum-row"><span className="t3">Date</span>        <span className="fw6 t1">{sessionDate}</span></div>
            <div className="sum-row"><span className="t3">Type</span>        <span className="fw6 t1">{sessionType}</span></div>
            <div className="sum-row"><span className="t3">Status</span>      <span className="fw6 t1">{sessionStatus}</span></div>
            <div className="sum-row"><span className="t3">Duration</span>    <span className="fw6 t1">{sessionDuration} min</span></div>
            <div className="sum-row"><span className="t3">Exercises</span>   <span className="fw6 t1">{exercises.length} logged</span></div>
            <div className="sum-row">
              <span className="t3">Steps / Water / Sleep</span>
              <span className="fw6 t1">{sessionHabits.steps||"—"} / {sessionHabits.water||"—"}L / {sessionHabits.sleep||"—"}h</span>
            </div>
            {hasMeasData    && <div className="sum-row"><span className="t3">Measurements</span><span className="fw6 tg">✓ Included</span></div>}
            {hasNutrition   && <div className="sum-row"><span className="t3">Nutrition</span><span className="fw6 tg">✓ Included</span></div>}
            {injuryFlag     && <div className="sum-row"><span className="t3">Injury Flag</span><span className="fw6 tr">{injuryFlag}</span></div>}
          </div>

          {/* What saves where */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="ch"><span className="ct">What Gets Saved</span></div>
            <div className="col gap6 fs11">
              {[
                { l: "Session log → Admin Sessions tab",       ok: true              },
                { l: "Habits → Client progress",               ok: true              },
                { l: `Exercises (${exercises.length}) → Session log`, ok: exercises.length > 0 },
                { l: "Measurements → Client progress",         ok: hasMeasData       },
                { l: "Nutrition → Client progress",            ok: hasNutrition      },
              ].map((item, i) => (
                <div key={i} className="row gap8">
                  <span style={{ color: item.ok ? "var(--green)" : "var(--t4)" }}>{item.ok ? "✓" : "○"}</span>
                  <span style={{ color: item.ok ? "var(--t2)"   : "var(--t4)" }}>{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise detail preview */}
          {exercises.length > 0 && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="ch"><span className="ct">Exercise Summary</span></div>
              {exercises.map((ex, i) => (
                <div key={i} style={{ marginBottom: i < exercises.length - 1 ? 10 : 0 }}>
                  <div className="fs12 fw7 t1">{ex.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginTop: 3 }}>
                    {ex.sets.map((s, si) => (
                      <span key={si} className="fs11 t3">
                        Set {si+1}: {s.reps||"—"} reps @ {s.load||"0"}kg
                      </span>
                    ))}
                    {ex.rpe && <span className="fs11 fw6" style={{ color: rpeColor(Number(ex.rpe)) }}>RPE {ex.rpe}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessionError && <div className="alert al-r mb8">{sessionError}</div>}
          {sessionSaved && <div className="alert al-g mb8">✓ Session logged! All data saved.</div>}

          <div className="wiz-nav">
            <button className="btn btn-g" style={{ flex: 1 }} onClick={() => setStep(4)}>← Back</button>
            <button
              className="btn btn-p"
              style={{ flex: 2, padding: "13px", fontSize: 14, opacity: sessionLoading ? 0.7 : 1 }}
              onClick={saveSession}
              disabled={sessionLoading}
            >
              {sessionLoading ? "Saving..." : "✓ Submit Session Log"}
            </button>
          </div>
          <div className="fs10 t3 mt8" style={{ textAlign: "center" }}>Late submissions are flagged to admin automatically.</div>
        </div>
      )}

      {/* ══════════════════════════════════════
          EXERCISE PICKER — BOTTOM SHEET
      ══════════════════════════════════════ */}
      {showPicker && (
        <div className="picker-ov" onClick={() => setShowPicker(false)}>
          <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="picker-handle" />

            <div className="picker-head">
              <div className="fs14 fw7 t1">Add Exercise</div>
              <button className="btn btn-g btn-xs" onClick={() => setShowPicker(false)}>✕ Close</button>
            </div>

            <div className="picker-tabs">
              {([
                { id: "library",  label: "📚 Library"  },
                { id: "template", label: "📋 Templates" },
                { id: "manual",   label: "✏️ Manual"    },
              ] as { id: "library"|"template"|"manual"; label: string }[]).map((t) => (
                <div key={t.id} className={`tab ${pickerTab === t.id ? "on" : ""}`}
                  style={{ fontSize: 11 }} onClick={() => setPickerTab(t.id)}>
                  {t.label}
                </div>
              ))}
            </div>

            {/* Library */}
            {pickerTab === "library" && (
              <div className="picker-body">
                <input className="fi" style={{ marginBottom: 10 }}
                  placeholder="🔍 Search exercise or muscle..."
                  value={libSearch} onChange={(e) => setLibSearch(e.target.value)} />
                {!libSearch.trim() && (
                  <div className="cat-scroll">
                    {ALL_CATS.map((cat) => (
                      <button key={cat} className={`cat-btn ${libCat === cat ? "on" : ""}`}
                        onClick={() => setLibCat(cat)}>{cat}</button>
                    ))}
                  </div>
                )}
                {libList.length === 0 && (
                  <div className="fs12 t3" style={{ textAlign: "center", padding: "16px 0" }}>No exercises found.</div>
                )}
                {libList.map((ex: any, i: number) => (
                  <div key={i} className="lib-row" onClick={() => addEx(ex.name, ex.muscles || ex._cat)}>
                    <div style={{ flex: 1 }}>
                      <div className="fs12 fw6 t1">{ex.name}</div>
                      <div className="fs10 t3">{ex.muscles || ex._cat}</div>
                    </div>
                    <span style={{ fontSize: 20, color: "var(--brand1)", fontWeight: 700 }}>+</span>
                  </div>
                ))}
              </div>
            )}

            {/* Templates */}
            {pickerTab === "template" && (
              <div className="picker-body">
                {templates.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                    <div className="fs13 fw6 t2">No templates assigned to you</div>
                    <div className="fs11 t3 mt4">Admin assigns templates from the Templates section</div>
                  </div>
                ) : templates.map((t) => (
                  <div key={t.id} className="tmpl-row" onClick={() => loadTemplate(t)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="fs13 fw7 t1">{t.name}</span>
                      <span className={`badge fs10 mla ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                    </div>
                    <div className="fs11 t3">{t.category} · {t.days} · {t.duration}</div>
                    {t.description && <div className="fs11 t2 mt4" style={{ lineHeight: 1.4 }}>{t.description}</div>}
                    <div className="fs11 mt6" style={{ color: "var(--brand1)", fontWeight: 600 }}>Tap to add as exercise →</div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual */}
            {pickerTab === "manual" && (
              <div className="picker-body">
                <div className="field">
                  <label>Exercise Name *</label>
                  <input className="fi" placeholder="e.g. Barbell Back Squat"
                    value={manualName} onChange={(e) => setManualName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Muscle Group</label>
                  <input className="fi" placeholder="e.g. Quads, Glutes"
                    value={manualMuscle} onChange={(e) => setManualMuscle(e.target.value)} />
                </div>
                <button className="btn btn-p" style={{ width: "100%", marginTop: 8 }}
                  onClick={() => { if (manualName.trim()) addEx(manualName.trim(), manualMuscle.trim()); }}
                  disabled={!manualName.trim()}>
                  + Add Exercise
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
