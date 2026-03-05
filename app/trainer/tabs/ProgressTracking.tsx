"use client";
import { useTrainer } from "../TrainerContext";
import { LineChart } from "../../components/ui/Charts";

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, minWidth: 260, maxWidth: "90vw",
      background: type === "success" ? "#1a3d2b" : "#3d1a1a",
      border: `1.5px solid ${type === "success" ? "#1e8a4c" : "#c0392b"}`,
      borderRadius: 12, padding: "13px 20px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      animation: "slideUp .25s ease",
    }}>
      <span style={{ fontSize: 18 }}>{type === "success" ? "✓" : "✕"}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: type === "success" ? "#4ade80" : "#f87171" }}>
        {message}
      </span>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Delta chip ────────────────────────────────────────────────
function Delta({ val, goodDown = false, unit = "" }: { val: number; goodDown?: boolean; unit?: string }) {
  const good = goodDown ? val < 0 : val > 0;
  const zero = val === 0;
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
      background: zero ? "var(--bg3)" : good ? "rgba(30,138,76,.12)" : "rgba(192,57,43,.12)",
      color: zero ? "var(--t3)" : good ? "var(--green)" : "var(--red)",
    }}>
      {val > 0 ? "▲" : val < 0 ? "▼" : "—"} {Math.abs(val).toFixed(1)}{unit}
    </span>
  );
}

// ── Metric card ───────────────────────────────────────────────
function MetricCard({ label, current, start, delta, goodDown, color, unit = "" }: any) {
  return (
    <div style={{
      background: "var(--bg1)", border: "1px solid var(--b0)",
      borderRadius: 12, padding: "16px 14px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}55)`,
      }} />
      <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--fd)", color, marginBottom: 6 }}>{current}{unit}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--t4)" }}>Start: {start}{unit}</span>
        <Delta val={delta} goodDown={goodDown} unit={unit} />
      </div>
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────
function Field({ label, k, val, onChange }: any) {
  return (
    <div style={{ marginBottom: 0 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--t3)", marginBottom: 5 }}>{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={val}
        onChange={(e) => onChange(k, e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box", height: 44,
          borderRadius: 8, border: "1.5px solid var(--b0)",
          background: "var(--bg2)", fontSize: 16, fontWeight: 700,
          color: "var(--t1)", textAlign: "center", outline: "none",
          padding: 0, fontFamily: "var(--fd)",
        }}
      />
    </div>
  );
}

const FIELDS = [
  ["weight","Weight (kg)"],["bf","Body Fat %"],["chest","Chest (cm)"],
  ["waist","Waist (cm)"],["hips","Hips (cm)"],["arms","Arms (cm)"],
  ["thighs","Thighs (cm)"],["squat","Squat (kg)"],["bench","Bench (kg)"],
  ["deadlift","Deadlift (kg)"],["pullup","Pull-ups"],
] as const;

const SECTIONS = [
  { title: "📐 Body Composition", keys: ["weight","bf","chest","waist","hips","arms","thighs"] },
  { title: "💪 Strength", keys: ["squat","bench","deadlift","pullup"] },
];

export default function ProgressTracking() {
  const {
    myClients, progressClient, setProgressClient,
    progressTab, setProgressTab,
    showLogProgress, setShowLogProgress,
    progressSaved, progressError, progressLoading,
    newProgress, setNewProgress,
    progressHistory, saveProgress,
  } = useTrainer();

  const ph = progressHistory[progressClient] || progressHistory[Object.keys(progressHistory)[0]] || [];

  const handleChange = (k: string, v: string) =>
    setNewProgress((p: any) => ({ ...p, [k]: v }));

  const selectStyle: React.CSSProperties = {
    height: 44, padding: "0 12px", borderRadius: 8,
    border: "1.5px solid var(--b0)", background: "var(--bg2)",
    fontSize: 16, color: "var(--t1)", outline: "none",
    fontFamily: "inherit", width: "auto", minWidth: 160,
    boxSizing: "border-box",
  };

  // ── Log form ──────────────────────────────────────────────
  const LogForm = ({ last }: { last?: any }) => (
    <div style={{
      background: "var(--bg1)", border: "1px solid var(--b0)",
      borderRadius: 12, padding: "18px 16px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>
            {last ? "New Progress Entry" : "Log First Entry"}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
          background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)", color: "var(--brand1)",
        }}>Today</span>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
            {section.title}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {section.keys.map((k) => {
              const field = FIELDS.find(([fk]) => fk === k);
              return field ? (
                <Field key={k} label={field[1]} k={k}
                  val={(newProgress as any)[k]}
                  onChange={handleChange} />
              ) : null;
            })}
          </div>
        </div>
      ))}

      {/* Save button */}
      <button
        onClick={() => saveProgress(last)}
        disabled={progressLoading}
        style={{
          width: "100%", height: 48, borderRadius: 10, border: "none",
          background: progressLoading ? "var(--bg3)" : "var(--brand1)",
          color: progressLoading ? "var(--t3)" : "#fff",
          fontSize: 15, fontWeight: 800, cursor: progressLoading ? "not-allowed" : "pointer",
          transition: "all .15s", marginTop: 4,
        }}
      >
        {progressLoading ? "Saving..." : "📏 Save Progress Entry"}
      </button>

      {/* Inline feedback */}
      {progressSaved && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 8,
          background: "rgba(30,138,76,.1)", border: "1px solid rgba(30,138,76,.3)",
          fontSize: 13, fontWeight: 700, color: "var(--green)", textAlign: "center",
        }}>✓ Progress entry saved!</div>
      )}
      {progressError && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 8,
          background: "rgba(192,57,43,.1)", border: "1px solid rgba(192,57,43,.3)",
          fontSize: 13, fontWeight: 700, color: "var(--red)", textAlign: "center",
        }}>✕ {progressError}</div>
      )}
    </div>
  );

  // ── Empty state ───────────────────────────────────────────
  if (ph.length === 0) return (
    <>
      {progressSaved && <Toast message={`Progress saved for ${progressClient}!`} type="success" />}
      {progressError && <Toast message={progressError} type="error" />}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--t1)" }}>Progress Tracking</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--t3)" }}>No entries yet — log the first below</p>
        </div>
        <select style={selectStyle} value={progressClient} onChange={(e) => setProgressClient(e.target.value)}>
          {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{
        padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13,
        background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)", color: "var(--blue)",
      }}>
        📊 No progress data for <strong>{progressClient}</strong> yet. Log the baseline below.
      </div>

      <LogForm />
    </>
  );

  const first = ph[0], last = ph[ph.length - 1];

  return (
    <>
      {/* Toast */}
      {progressSaved && <Toast message={`Progress entry saved for ${progressClient}!`} type="success" />}
      {progressError && <Toast message={progressError} type="error" />}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--t1)" }}>Progress Tracking</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--t3)" }}>{ph.length} entries · {progressClient}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select style={selectStyle} value={progressClient} onChange={(e) => setProgressClient(e.target.value)}>
            {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setShowLogProgress(!showLogProgress)}
            style={{
              height: 44, padding: "0 16px", borderRadius: 8,
              border: "none", background: showLogProgress ? "var(--bg3)" : "var(--brand1)",
              color: showLogProgress ? "var(--t2)" : "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {showLogProgress ? "✕ Cancel" : "+ Log Progress"}
          </button>
        </div>
      </div>

      {/* Log form (collapsible) */}
      {showLogProgress && <LogForm last={last} />}

      {/* ── Metric cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
        <MetricCard label="Weight" current={last.weight} start={first.weight}
          delta={last.weight - first.weight} goodDown unit="kg" color="var(--brand1)" />
        <MetricCard label="Body Fat" current={last.bf} start={first.bf}
          delta={last.bf - first.bf} goodDown unit="%" color="var(--purple)" />
        <MetricCard label="Waist" current={last.waist} start={first.waist}
          delta={last.waist - first.waist} goodDown unit="cm" color="var(--blue)" />
        <MetricCard label="Squat" current={last.squat} start={first.squat}
          delta={last.squat - first.squat} unit="kg" color="var(--green)" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[["overview","Overview"],["weight","Weight"],["measurements","Measurements"],["strength","Strength"]].map(([id, label]) => (
          <button key={id}
            onClick={() => setProgressTab(id)}
            style={{
              height: 36, padding: "0 14px", borderRadius: 8,
              border: progressTab === id ? "none" : "1px solid var(--b0)",
              background: progressTab === id ? "var(--brand1)" : "var(--bg2)",
              color: progressTab === id ? "#fff" : "var(--t3)",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >{label}</button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {progressTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>

          {/* Weight + Strength charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Weight (kg)", key: "weight", color: "var(--brand1)", badge: `${Math.abs(last.weight - first.weight).toFixed(1)}kg ${last.weight < first.weight ? "lost" : "gained"}`, good: last.weight <= first.weight },
              { label: "Squat (kg)",  key: "squat",  color: "var(--green)",  badge: `+${last.squat - first.squat}kg`, good: true },
            ].map((chart) => (
              <div key={chart.key} style={{
                background: "var(--bg1)", border: "1px solid var(--b0)",
                borderRadius: 12, padding: "14px 12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}>{chart.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: chart.good ? "rgba(30,138,76,.1)" : "rgba(192,57,43,.1)",
                    color: chart.good ? "var(--green)" : "var(--red)",
                  }}>{chart.badge}</span>
                </div>
                <LineChart data={ph.map((p: any) => p[chart.key])} color={chart.color} />
              </div>
            ))}
          </div>

          {/* Body measurements grid */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--b0)", borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--t1)", marginBottom: 12 }}>Body Measurements</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { l:"Chest", k:"chest" },{ l:"Waist", k:"waist" },{ l:"Hips", k:"hips" },
                { l:"Arms", k:"arms" },{ l:"Thighs", k:"thighs" },{ l:"Body Fat", k:"bf", unit:"%" },
              ].map((m) => {
                const delta = (last as any)[m.k] - (first as any)[m.k];
                const good = m.k === "arms" ? delta > 0 : delta < 0;
                return (
                  <div key={m.k} style={{
                    background: "var(--bg2)", borderRadius: 8,
                    padding: "10px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", color: "var(--t1)" }}>
                      {(last as any)[m.k]}{m.unit || "cm"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 3 }}>{m.l}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4, color: good ? "var(--green)" : "var(--red)" }}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(1)}{m.unit || "cm"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--b0)", borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--t1)", marginBottom: 12 }}>Progress Timeline</div>
            <div>
              {ph.slice().reverse().map((p: any, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "8px 0", borderBottom: i < ph.length - 1 ? "1px solid var(--b0)" : "none",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                    background: i === 0 ? "var(--brand1)" : "var(--b1)",
                  }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}>{p.date}</span>
                    <span style={{ fontSize: 11, color: "var(--t3)", marginLeft: 8 }}>
                      {p.weight}kg · {p.waist}cm waist · Squat {p.squat}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Weight tab ── */}
      {progressTab === "weight" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          {[
            { label: "Weight Over Time (kg)", key: "weight", color: "var(--brand1)" },
            { label: "Body Fat %",            key: "bf",     color: "var(--purple)" },
          ].map((chart) => (
            <div key={chart.key} style={{ background: "var(--bg1)", border: "1px solid var(--b0)", borderRadius: 12, padding: "14px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--t1)" }}>{chart.label}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(201,168,76,.1)", color: "var(--brand1)" }}>
                    Start: {(first as any)[chart.key]}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(30,138,76,.1)", color: "var(--green)" }}>
                    Now: {(last as any)[chart.key]}
                  </span>
                </div>
              </div>
              <LineChart data={ph.map((p: any) => p[chart.key])} color={chart.color} />
            </div>
          ))}
        </div>
      )}

      {/* ── Measurements tab ── */}
      {progressTab === "measurements" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { l:"Chest (cm)", k:"chest", c:"var(--brand1)" },
            { l:"Waist (cm)", k:"waist", c:"var(--blue)" },
            { l:"Hips (cm)",  k:"hips",  c:"var(--purple)" },
            { l:"Arms (cm)",  k:"arms",  c:"var(--green)" },
          ].map((m) => {
            const delta = (last as any)[m.k] - (first as any)[m.k];
            const good = m.k === "arms" ? delta > 0 : delta < 0;
            return (
              <div key={m.k} style={{ background: "var(--bg1)", border: "1px solid var(--b0)", borderRadius: 12, padding: "14px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--t1)" }}>{m.l}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: good ? "rgba(30,138,76,.1)" : "rgba(192,57,43,.1)", color: good ? "var(--green)" : "var(--red)" }}>
                    {delta > 0 ? "+" : ""}{delta}cm
                  </span>
                </div>
                <LineChart data={ph.map((p: any) => (p as any)[m.k])} color={m.c} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>Start: {(first as any)[m.k]}cm</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: m.c }}>Now: {(last as any)[m.k]}cm</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Strength tab ── */}
      {progressTab === "strength" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { l:"Squat (kg)",       k:"squat",    c:"var(--green)"  },
            { l:"Bench Press (kg)", k:"bench",    c:"var(--brand1)" },
            { l:"Deadlift (kg)",    k:"deadlift", c:"var(--purple)" },
            { l:"Pull-ups (reps)",  k:"pullup",   c:"var(--blue)"   },
          ].map((m) => {
            const delta = (last as any)[m.k] - (first as any)[m.k];
            const u = m.k === "pullup" ? " reps" : "kg";
            return (
              <div key={m.k} style={{ background: "var(--bg1)", border: "1px solid var(--b0)", borderRadius: 12, padding: "14px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--t1)" }}>{m.l}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(30,138,76,.1)", color: "var(--green)" }}>
                    +{delta}{u}
                  </span>
                </div>
                <LineChart data={ph.map((p: any) => (p as any)[m.k])} color={m.c} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>Start: {(first as any)[m.k]}{u}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: m.c }}>Now: {(last as any)[m.k]}{u}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
