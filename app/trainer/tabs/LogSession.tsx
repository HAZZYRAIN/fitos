"use client";
import { useTrainer } from "../TrainerContext";

type HabitKey = "steps" | "water" | "sleep" | "sleepQuality" | "activeMinutes" | "protein" | "calories" | "carbs" | "fats";
type MeasurementKey = "weight" | "chest" | "waist" | "hips" | "arms";

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
    sessionMeasurements, setSessionMeasurements,
    sessionError, sessionLoading, sessionSaved,
    saveSession,
    setTab,
  } = useTrainer();

  const missingHabits = (["steps", "water", "sleep"] as HabitKey[]).filter(
    (k) => !sessionHabits[k]
  );

  const getHabit       = (k: HabitKey)       => sessionHabits[k] || "";
  const getMeasurement = (k: MeasurementKey) => sessionMeasurements[k] || "";

  const isMissing = (k: string) =>
    sessionError && ["steps", "water", "sleep"].includes(k) && !sessionHabits[k as HabitKey];

  const hasMeasurementData = Object.values(sessionMeasurements).some((v) => v !== "");

  return (
    <>
      <style>{`
        .ls-section-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; padding: 2px 8px;
          border-radius: 8px; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .ls-optional {
          background: rgba(184,134,11,0.1); color: var(--yellow);
          border: 1px solid rgba(184,134,11,0.2);
        }
        .ls-required {
          background: rgba(192,57,43,0.1); color: var(--red);
          border: 1px solid rgba(192,57,43,0.15);
        }
        .ls-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 640px) {
          .ls-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
        }
        .measure-filled {
          border-left: 3px solid var(--brand1);
        }
      `}</style>

      <div className="sh">
        <div className="sh-l">
          <h2>Log Session</h2>
          <p>Must be submitted within 2 hours of session end</p>
        </div>
      </div>

      <div className="ls-grid">

        {/* ════ LEFT COLUMN ════ */}
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
                <option>Strength Training</option>
                <option>Cardio</option>
                <option>HIIT</option>
                <option>Mobility</option>
                <option>Rehab</option>
                <option>Mixed</option>
              </select>
            </div>
            <div className="field">
              <label>
                Quality Notes *{" "}
                <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span>
              </label>
              <textarea
                className="fi"
                rows={3}
                placeholder="What went well? Technique issues? Client energy? Weight changes?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                style={{
                  resize: "none",
                  borderColor: !sessionNotes.trim() && sessionError ? "var(--red)" : undefined,
                }}
              />
            </div>
            {sessionStatus.toLowerCase().includes("modified") && (
              <div className="field">
                <label>Modification Reason *</label>
                <textarea
                  className="fi" rows={2}
                  placeholder="Why was the session modified?"
                  value={sessionModReason}
                  onChange={(e) => setSessionModReason(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>
            )}
          </div>

          {/* ── BODY MEASUREMENTS (optional) ── */}
          <div className={`card mb16 ${hasMeasurementData ? "measure-filled" : ""}`}>
            <div className="ch">
              <span className="ct">📏 Body Measurements</span>
              <span className="ls-section-tag ls-optional">Optional</span>
            </div>
            <div className="fs11 t3 mb12" style={{ lineHeight: 1.5 }}>
              Fill if you took measurements this session. Saves to client's progress history in admin.
            </div>
            <div className="g2">
              {([
                { k: "weight", l: "Weight (kg)",  p: "e.g. 72.5" },
                { k: "chest",  l: "Chest (cm)",   p: "e.g. 98"   },
                { k: "waist",  l: "Waist (cm)",   p: "e.g. 82"   },
                { k: "hips",   l: "Hips (cm)",    p: "e.g. 94"   },
                { k: "arms",   l: "Arms (cm)",    p: "e.g. 34"   },
              ] as { k: MeasurementKey; l: string; p: string }[]).map(({ k, l, p }) => (
                <div key={k} className="field">
                  <label>{l}</label>
                  <input
                    className="fi"
                    type="number"
                    step="0.1"
                    placeholder={p}
                    value={getMeasurement(k)}
                    onChange={(e) => setSessionMeasurements((prev: any) => ({ ...prev, [k]: e.target.value }))}
                    style={{
                      borderColor: getMeasurement(k) ? "var(--brand1)" : undefined,
                    }}
                  />
                </div>
              ))}
            </div>
            {hasMeasurementData && (
              <div className="alert al-g fs11 mt8">
                ✓ Measurements will appear in admin client progress tab
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
                <option>Knee Pain</option>
                <option>Back Pain</option>
                <option>Shoulder Pain</option>
                <option>Dizziness</option>
                <option>Medical Risk — Needs Review</option>
                <option>Client Requested Reduced Intensity</option>
              </select>
            </div>
            {injuryFlag && (
              <div className="alert al-r fs11">⚠ Flag visible to admin immediately</div>
            )}
          </div>

          {/* Nutrition */}
          <div className="card mb16">
            <div className="ch">
              <span className="ct">🥩 Nutrition</span>
              <span className="ls-section-tag ls-optional">Optional</span>
            </div>
            <div className="g2">
              {([
                { k: "protein",  l: "Protein (g)",  p: "e.g. 120"  },
                { k: "calories", l: "Calories",      p: "e.g. 2000" },
                { k: "carbs",    l: "Carbs (g)",     p: "e.g. 200"  },
                { k: "fats",     l: "Fats (g)",      p: "e.g. 60"   },
              ] as { k: HabitKey; l: string; p: string }[]).map(({ k, l, p }) => (
                <div key={k} className="field">
                  <label>{l}</label>
                  <input
                    className="fi" type="number" placeholder={p}
                    value={getHabit(k)}
                    onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Daily Habits */}
          <div className="card mb16">
            <div className="ch">
              <span className="ct">🔁 Daily Habits</span>
              <span className="ls-section-tag ls-required">Required</span>
            </div>
            <div className="fs11 t3 mb12">
              Steps, water, and sleep must be filled for every session.
            </div>
            <div className="g2">
              {([
                { k: "steps",         l: "Step Count *",             p: "e.g. 8000", step: undefined },
                { k: "water",         l: "Water Intake (L) *",       p: "e.g. 2.5",  step: "0.1"    },
                { k: "sleep",         l: "Sleep Last Night (hrs) *", p: "e.g. 7",    step: "0.5"    },
                { k: "activeMinutes", l: "Active Minutes",           p: "e.g. 45",   step: undefined },
              ] as { k: HabitKey; l: string; p: string; step?: string }[]).map(({ k, l, p, step }) => (
                <div key={k} className="field">
                  <label>
                    {l}{" "}
                    {isMissing(k) && <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span>}
                  </label>
                  <input
                    className="fi" type="number" step={step} placeholder={p}
                    value={getHabit(k)}
                    onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, [k]: e.target.value }))}
                    style={{ borderColor: isMissing(k) ? "var(--red)" : undefined }}
                  />
                </div>
              ))}
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Sleep Quality</label>
                <select
                  className="fi"
                  value={sessionHabits.sleepQuality || "Good"}
                  onChange={(e) => setSessionHabits((prev: any) => ({ ...prev, sleepQuality: e.target.value }))}
                >
                  <option>Great</option>
                  <option>Good</option>
                  <option>Average</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
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
                  <input className="log-inp" type="number" placeholder="3" value={ex.sets}
                    onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, sets: e.target.value } : x))} />
                  <input className="log-inp" type="number" placeholder="10" value={ex.reps}
                    onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, reps: e.target.value } : x))} />
                  <input className="log-inp" type="number" placeholder="0" value={ex.weight}
                    onChange={(e) => setSessionExercises((p: any[]) => p.map((x: any, j: number) => j === i ? { ...x, weight: e.target.value } : x))} />
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 13, padding: 0 }}
                    onClick={() => setSessionExercises((p: any[]) => p.filter((_: any, j: number) => j !== i))}
                  >✕</button>
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
                  <div className="row"><span className="fs12 t3">Remaining</span><span className={`fs12 fw7 mla ${(c.classesLeft || 0) <= 3 ? "tr" : "tg"}`}>{c.classesLeft || 0}</span></div>
                  <div className="row"><span className="fs12 t3">Compliance</span><span className="fs12 fw7 mla">{c.compliance || 0}%</span></div>
                  <div className="row"><span className="fs12 t3">Last Session</span><span className="fs12 mla">{c.lastSession || "—"}</span></div>
                  {(c.classesLeft || 0) <= 2 && (
                    <div className="alert al-r fs11">
                      ⚠ {c.classesLeft || 0} session{(c.classesLeft || 0) !== 1 ? "s" : ""} left — inform admin.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* What gets saved summary */}
          <div className="card mb16">
            <div className="ch"><span className="ct">What Gets Saved</span></div>
            <div className="col gap6" style={{ fontSize: 11 }}>
              <div className="row gap8">
                <span style={{ color: "var(--green)" }}>✓</span>
                <span className="t2">Session log → visible in admin Sessions tab</span>
              </div>
              <div className="row gap8">
                <span style={{ color: "var(--green)" }}>✓</span>
                <span className="t2">Habits (steps, water, sleep) → client progress</span>
              </div>
              <div className="row gap8">
                <span style={{ color: hasMeasurementData ? "var(--green)" : "var(--t4)" }}>
                  {hasMeasurementData ? "✓" : "○"}
                </span>
                <span className={hasMeasurementData ? "t2" : "t4"}>
                  Body measurements → client progress {hasMeasurementData ? "(filled ✓)" : "(not filled)"}
                </span>
              </div>
              <div className="row gap8">
                <span style={{ color: (sessionHabits.protein || sessionHabits.calories) ? "var(--green)" : "var(--t4)" }}>
                  {(sessionHabits.protein || sessionHabits.calories) ? "✓" : "○"}
                </span>
                <span className={(sessionHabits.protein || sessionHabits.calories) ? "t2" : "t4"}>
                  Nutrition → client progress {(sessionHabits.protein || sessionHabits.calories) ? "(filled ✓)" : "(not filled)"}
                </span>
              </div>
              <div className="row gap8">
                <span style={{ color: sessionExercises.length > 0 ? "var(--green)" : "var(--t4)" }}>
                  {sessionExercises.length > 0 ? "✓" : "○"}
                </span>
                <span className={sessionExercises.length > 0 ? "t2" : "t4"}>
                  Performance ({sessionExercises.length} exercises) → client progress
                </span>
              </div>
            </div>
          </div>

          {/* Missing habits reminder */}
          {missingHabits.length > 0 && (
            <div className="alert al-y mb8 fs11">
              📋 Still needed:{" "}
              {missingHabits
                .map((k) => ({ steps: "Step Count", water: "Water Intake", sleep: "Sleep" } as Record<HabitKey, string>)[k])
                .join(", ")}
            </div>
          )}

          {sessionError && <div className="alert al-r mb8">{sessionError}</div>}
          {sessionSaved && (
            <div className="alert al-g mb8">
              ✓ Session logged! Progress updated in admin client tab.
            </div>
          )}

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
