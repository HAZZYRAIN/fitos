"use client";
// ============================================================
// LOG SESSION — FIXED
// Fix 1: Save button shows loading state (sessionLoading from context)
// Fix 2: Notes field marked required visually
// Fix 3: Error display improved
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
    sessionError, sessionLoading, sessionSaved, // FIX: added sessionLoading
    saveSession,
    setTab,
  } = useTrainer();

  return (
    <>
      <div className="sh">
        <div className="sh-l">
          <h2>Log Session</h2>
          <p>Must be submitted within 2 hours of session end</p>
        </div>
      </div>

      <div className="g2">
        {/* ── LEFT COLUMN ── */}
        <div>
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

            {/* FIX: visually marked as required */}
            <div className="field">
              <label>Quality Notes * <span style={{ color: "var(--red)", fontSize: 10 }}>Required</span></label>
              <textarea
                className="fi"
                rows={3}
                placeholder="What went well? Technique issues? Client energy? Weight changes?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                style={{ resize: "none", borderColor: !sessionNotes.trim() && sessionError ? "var(--red)" : undefined }}
              />
            </div>

            {sessionStatus.toLowerCase().includes("modified") && (
              <div className="field">
                <label>Modification Reason *</label>
                <textarea
                  className="fi"
                  rows={2}
                  placeholder="Why was the session modified from the plan?"
                  value={sessionModReason}
                  onChange={(e) => setSessionModReason(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>
            )}
          </div>

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
              <div className="alert al-r fs11">⚠ This flag will be visible to admin immediately</div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          <div className="card mb16">
            <div className="ch">
              <span className="ct">Exercises Logged</span>
              <button className="btn btn-g btn-xs" onClick={() => setTab("library")}>+ From Library</button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div className="row" style={{ padding: "6px 0", borderBottom: "1px solid var(--b1)" }}>
                <span className="fs10 t3" style={{ flex: 1 }}>Exercise</span>
                <span className="fs10 t3" style={{ width: 66, textAlign: "center" }}>Sets</span>
                <span className="fs10 t3" style={{ width: 66, textAlign: "center" }}>Reps</span>
                <span className="fs10 t3" style={{ width: 66, textAlign: "center" }}>Weight</span>
              </div>
              {sessionExercises.length === 0 && (
                <div className="fs12 t3 mt8">No exercises added yet. Use the library to add exercises.</div>
              )}
              {sessionExercises.map((ex, i) => (
                <div
                  key={i}
                  className="log-row"
                  style={{ gridTemplateColumns: "1fr 60px 60px 60px 32px" }}
                >
                  <div>
                    <div className="fs12 fw6 t1">{ex.name}</div>
                    <div className="fs10 t3">{ex.muscles}</div>
                  </div>
                  <input
                    className="log-inp"
                    type="number"
                    placeholder="3"
                    value={ex.sets}
                    onChange={(e) =>
                      setSessionExercises((p: any[]) =>
                        p.map((x: any, j: number) => j === i ? { ...x, sets: e.target.value } : x)
                      )
                    }
                  />
                  <input
                    className="log-inp"
                    type="number"
                    placeholder="10"
                    value={ex.reps}
                    onChange={(e) =>
                      setSessionExercises((p: any[]) =>
                        p.map((x: any, j: number) => j === i ? { ...x, reps: e.target.value } : x)
                      )
                    }
                  />
                  <input
                    className="log-inp"
                    type="number"
                    placeholder="0"
                    value={ex.weight}
                    onChange={(e) =>
                      setSessionExercises((p: any[]) =>
                        p.map((x: any, j: number) => j === i ? { ...x, weight: e.target.value } : x)
                      )
                    }
                  />
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", fontSize: 14, padding: 0 }}
                    onClick={() =>
                      setSessionExercises((p: any[]) => p.filter((_: any, j: number) => j !== i))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-g btn-xs mt8" onClick={() => setTab("library")}>
              + Add Exercise
            </button>
          </div>

          {/* Client snapshot */}
          {logClient && (
            <div className="card mb16">
              <div className="ch"><span className="ct">Client Snapshot: {logClient}</span></div>
              {(() => {
                const c = myClients.find((cl) => cl.name === logClient);
                if (!c) return null;
                return (
                  <div className="col gap8">
                    {c.medicalNotes && (
                      <div className="alert al-y fs11">📌 {c.medicalNotes}</div>
                    )}
                    <div className="row">
                      <span className="fs12 t3">Sessions Done</span>
                      <span className="fs12 fw7 mla">{c.sessionsLogged || 0}/{c.sessionsIncluded || 0}</span>
                    </div>
                    <div className="row">
                      <span className="fs12 t3">Remaining</span>
                      <span className={`fs12 fw7 mla ${(c.classesLeft || 0) <= 3 ? "tr" : "tg"}`}>
                        {c.classesLeft || 0} sessions
                      </span>
                    </div>
                    <div className="row">
                      <span className="fs12 t3">Compliance</span>
                      <span className="fs12 fw7 mla">{c.compliance || 0}%</span>
                    </div>
                    <div className="row">
                      <span className="fs12 t3">Last Session</span>
                      <span className="fs12 mla">{c.lastSession || "—"}</span>
                    </div>
                    {(c.classesLeft || 0) <= 2 && (
                      <div className="alert al-r fs11">
                        ⚠ Only {c.classesLeft || 0} session{(c.classesLeft || 0) !== 1 ? "s" : ""} left — inform admin for renewal.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Error */}
          {sessionError && (
            <div className="alert al-r mb8">{sessionError}</div>
          )}

          {/* Success */}
          {sessionSaved && (
            <div className="alert al-g mb8">✓ Session logged successfully!</div>
          )}

          {/* FIX: Save button shows loading state, disabled while saving */}
          <button
            className="btn btn-p"
            style={{
              width: "100%",
              padding: "13px",
              fontSize: 14,
              opacity: sessionLoading ? 0.7 : 1,
              cursor: sessionLoading ? "not-allowed" : "pointer",
            }}
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
