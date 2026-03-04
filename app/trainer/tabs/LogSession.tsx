"use client";
// ============================================================
// LOG SESSION — with mandatory Nutrition + Habits section
// Steps, water, and sleep are required before submit.
// Saves habits + nutrition separately to dietLogs (type: "habits" / "nutrition")
// so ClientDetail tabs stay in sync automatically.
// ============================================================
import { useTrainer } from "../TrainerContext";

export default function LogSession() {
  const {
    myClients,
    logClient, setLogClient,
    sessionDate, setSessionDate,
    sessionDuration, setSessionDuration,
    sessionStatus, setSessionStatus,
    sessionType, setSessionType,
    sessionNotes, setSessionNotes,
    sessionModReason, setSessionModReason,
    injuryFlag, setInjuryFlag,
    sessionExercises, setSessionExercises,
    sessionHabits, setSessionHabits,
    sessionError, sessionLoading, sessionSaved,
    saveSession,
    setTab,
  } = useTrainer();

  const missingHabits = (["steps", "water", "sleep"] as const).filter(
    (k) => !sessionHabits[k]
  );

  return (
    <>
      <div className="sh">
        <div className="sh-l">
          <h2>Log Session</h2>
          <p>Must be submitted within 2 hours of session end</p>
        </div>
      </div>

      <div className="g2">

        {/* ════ LEFT ════ */}
        <div>

          {/* Session Details */}
          <div className="card mb16">
            <div className="ch"><span className="ct">Session Details</span></div>
            <div className="field">
              <label>Client *</label>
              <select className="fi" value={logClient} onChange={(e) => setLogClient(e.target.value)}>
                <option value="">Select client...</option>
                {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
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
              <label>Session Status *</label>
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
                <option>Strength Training</option><option>Cardio</option><option>HIIT</option>
                <option>Mobility</option><option>Rehab</option><option>Mixed</option>
              </select>
            </div>
            <div className="field">
              <label>Quality Notes * <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span></label>
              <textarea className="fi" rows={3}
                placeholder="What went well? Technique issues? Client energy? Weight changes?"
                value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)}
                style={{ resize: "none", borderColor: !sessionNotes.trim() && sessionError ? "var(--red)" : undefined }}
              />
            </div>
            {sessionStatus.toLowerCase().includes("modified") && (
              <div className="field">
                <label>Modification Reason *</label>
                <textarea className="fi" rows={2} placeholder="Why was the session modified?"
                  value={sessionModReason} onChange={(e) => setSessionModReason(e.target.value)}
                  style={{ resize: "none" }} />
              </div>
            )}
          </div>

          {/* Injury */}
          <div className="card mb16">
            <div className="ch"><span className="ct">Injury / Risk Flag</span></div>
            <div className="field">
              <label>Flag Type (if any)</label>
              <select className="fi" value={injuryFlag} onChange={(e) => setInjuryFlag(e.target.value)}>
                <option value="">No issues</option>
                <option>Knee Pain</option><option>Back Pain</option><option>Shoulder Pain</option>
                <option>Dizziness</option><option>Medical Risk — Needs Review</option>
                <option>Client Requested Reduced Intensity</option>
              </select>
            </div>
            {injuryFlag && <div className="alert al-r fs11">⚠ Flag visible to admin immediately</div>}
          </div>

          {/* Nutrition — optional */}
          <div className="card mb16">
            <div className="ch">
              <span className="ct">🥩 Nutrition</span>
              <span className="badge by fs10">Optional</span>
            </div>
            <div className="g2">
              {[
                { k: "protein",  l: "Protein (g)",  p: "e.g. 120" },
                { k: "calories", l: "Calories",      p: "e.g. 2000" },
                { k: "carbs",    l: "Carbs (g)",     p: "e.g. 200" },
                { k: "fats",     l: "Fats (g)",      p: "e.g. 60" },
              ].map(({ k, l, p }) => (
                <div key={k} className="field">
                  <label>{l}</label>
                  <input className="fi" type="number" placeholder={p}
                    value={sessionHabits[k as keyof typeof sessionHabits] || ""}
                    onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Habits — mandatory */}
          <div className="card mb16">
            <div className="ch">
              <span className="ct">🔁 Daily Habits</span>
              <span className="badge br fs10">Required</span>
            </div>
            <div className="fs11 t3 mb12">Steps, water, and sleep must be filled for every session.</div>
            <div className="g2">
              {[
                { k: "steps",         l: "Step Count *",          p: "e.g. 8000",  t: "number", step: undefined },
                { k: "water",         l: "Water Intake (L) *",    p: "e.g. 2.5",   t: "number", step: "0.1" },
                { k: "sleep",         l: "Sleep Last Night (hrs)*",p: "e.g. 7",     t: "number", step: "0.5" },
                { k: "activeMinutes", l: "Active Minutes",         p: "e.g. 45",   t: "number", step: undefined },
              ].map(({ k, l, p, t, step }) => (
                <div key={k} className="field">
                  <label>
                    {l}{" "}
                    {sessionError && ["steps","water","sleep"].includes(k) && !sessionHabits[k] && (
                      <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span>
                    )}
                  </label>
                  <input className="fi" type={t} step={step} placeholder={p}
                    value={sessionHabits[k] || ""}
                    onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, [k]: e.target.value }))}
                    style={{ borderColor: sessionError && ["steps","water","sleep"].includes(k) && !sessionHabits[k] ? "var(--red)" : undefined }}
                  />
                </div>
              ))}
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Sleep Quality</label>
                <select className="fi"
                  value={sessionHabits.sleepQuality || "Good"}
                  onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, sleepQuality: e.target.value }))}
                >
                  <option>Great</option><option>Good</option><option>Average</option><option>Poor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT ════ */}
        <div>

          {/* Exercises */}
          <div className="card mb16">
            <div className="ch">
              <span className="ct">Exercises Logged</span>
              <button className="btn btn-g btn-xs" onClick={() => setTab("library")}>+ From Library</button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--b1)" }}>
                <span className="fs10 t3" style={{ flex: 1 }}>Exercise</span>
                <span className="fs10 t3" style={{ width: 54, textAlign: "center" }}>Sets</span>
                <span className="fs10 t3" style={{ width: 54, textAlign: "center" }}>Reps</span>
                <span className="fs10 t3" style={{ width: 54, textAlign: "center" }}>kg</span>
              </div>
              {sessionExercises.length === 0 && (
                <div className="fs12 t3 mt8">No exercises added. Use the library.</div>
              )}
              {sessionExercises.map((ex, i) => (
                <div key={i} className="log-row" style={{ gridTemplateColumns: "1fr 50px 50px 50px 28px" }}>
                  <div>
                    <div className="fs12 fw6 t1">{ex.name}</div>
                    <div className="fs10 t3">{ex.muscles}</div>
                  </div>
                  <input className="log-inp" type="number" placeholder="3"  value={ex.sets}
                    onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, sets: e.target.value } : x))} />
                  <input className="log-inp" type="number" placeholder="10" value={ex.reps}
                    onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, reps: e.target.value } : x))} />
                  <input className="log-inp" type="number" placeholder="0"  value={ex.weight}
                    onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, weight: e.target.value } : x))} />
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 13, padding: 0 }}
                    onClick={() => setSessionExercises((p: any[]) => p.filter((_: any, j: number) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn btn-g btn-xs mt8" onClick={() => setTab("library")}>+ Add Exercise</button>
          </div>

          {/* Client Snapshot */}
          {logClient && (() => {
            const c = myClients.find((cl) => cl.name === logClient);
            if (!c) return null;
            return (
              <div className="card mb16">
                <div className="ch"><span className="ct">Snapshot: {logClient}</span></div>
                <div className="col gap8">
                  {c.medicalNotes && <div className="alert al-y fs11">📌 {c.medicalNotes}</div>}
                  <div className="row"><span className="fs12 t3">Sessions Done</span><span className="fs12 fw7 mla">{c.sessionsLogged || 0}/{c.sessionsIncluded || 0}</span></div>
                  <div className="row"><span className="fs12 t3">Remaining</span><span className={`fs12 fw7 mla ${(c.classesLeft||0)<=3?"tr":"tg"}`}>{c.classesLeft||0}</span></div>
                  <div className="row"><span className="fs12 t3">Compliance</span><span className="fs12 fw7 mla">{c.compliance||0}%</span></div>
                  <div className="row"><span className="fs12 t3">Last Session</span><span className="fs12 mla">{c.lastSession||"—"}</span></div>
                  {(c.classesLeft||0) <= 2 && <div className="alert al-r fs11">⚠ {c.classesLeft||0} session{(c.classesLeft||0)!==1?"s":""} left — inform admin.</div>}
                </div>
              </div>
            );
          })()}

          {/* Habit checklist reminder */}
          {missingHabits.length > 0 && (
            <div className="alert al-y mb8 fs11">
              📋 Still needed: {missingHabits.map((k) =>
                ({ steps: "Step Count", water: "Water Intake", sleep: "Sleep" })[k]
              ).join(", ")}
            </div>
          )}

          {sessionError && <div className="alert al-r mb8">{sessionError}</div>}
          {sessionSaved && <div className="alert al-g mb8">✓ Session logged successfully!</div>}

          <button
            className="btn btn-p"
            style={{ width: "100%", padding: "13px", fontSize: 14, opacity: sessionLoading ? 0.7 : 1 }}
            onClick={saveSession}
            disabled={sessionLoading}
          >
            {sessionLoading ? "Saving..." : "✓ Submit Session Log"}
          </button>
          <div className="fs10 t3 mt8" style={{ textAlign: "center" }}>
            Late submissions are flagged to admin.
          </div>
        </div>
      </div>
    </>
  );
}
