"use client";
import { useTrainer } from "../TrainerContext";
import { LineChart } from "../../components/ui/Charts";

const PROTEIN_TARGET = 120, WATER_TARGET = 3.0, STEPS_TARGET = 10000, SLEEP_TARGET = 8;
const n = (v: any) => Number(v) || 0;

// ── Toast component ───────────────────────────────────────────
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
      <span style={{
        fontSize: 14, fontWeight: 700,
        color: type === "success" ? "#4ade80" : "#f87171",
      }}>{message}</span>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, target, pct, color }: any) {
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
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--fd)", color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 8 }}>{target}</div>
      <div style={{ height: 4, background: "var(--bg3)", borderRadius: 2 }}>
        <div style={{
          height: "100%", borderRadius: 2, transition: "width .4s ease",
          width: `${pct}%`,
          background: pct >= 90 ? "var(--green)" : pct >= 70 ? "var(--yellow)" : "var(--red)",
        }} />
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, marginTop: 5,
        color: pct >= 90 ? "var(--green)" : pct >= 70 ? "var(--yellow)" : "var(--red)",
      }}>{pct}% of target</div>
    </div>
  );
}

// ── Field component ───────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export default function DietHabits() {
  const {
    myClients, dietClient, setDietClient,
    dietSaved, dietError, dietLoading, newDiet, setNewDiet,
    dietHistory, saveDiet,
  } = useTrainer();

  const dh = dietHistory[dietClient] || dietHistory[Object.keys(dietHistory)[0]] || [];

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    height: 46, padding: "0 12px", borderRadius: 8,
    border: "1.5px solid var(--b0)", background: "var(--bg2)",
    fontSize: 16, color: "var(--t1)", outline: "none",
    fontFamily: "inherit",
  };

  const selectStyle: React.CSSProperties = { ...inputStyle };

  // ── Log form (shared between empty + full view) ───────────
  const LogForm = () => (
    <div style={{
      background: "var(--bg1)", border: "1px solid var(--b0)",
      borderRadius: 12, padding: "18px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>Log Today's Habits</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
          background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)", color: "var(--brand1)",
        }}>Today</span>
      </div>

      {/* Nutrition row */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
          🥩 Nutrition
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={`Protein (g) — target ${PROTEIN_TARGET}g`}>
            <input style={inputStyle} type="number" inputMode="numeric" placeholder="e.g. 120"
              value={newDiet.protein} onChange={(e) => setNewDiet((p: any) => ({ ...p, protein: e.target.value }))} />
          </Field>
          <Field label={`Water (L) — target ${WATER_TARGET}L`}>
            <input style={inputStyle} type="number" inputMode="decimal" step="0.1" placeholder="e.g. 2.5"
              value={newDiet.water} onChange={(e) => setNewDiet((p: any) => ({ ...p, water: e.target.value }))} />
          </Field>
        </div>
      </div>

      {/* Activity row */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>
          🚶 Activity & Recovery
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={`Steps — target ${STEPS_TARGET.toLocaleString()}`}>
            <input style={inputStyle} type="number" inputMode="numeric" placeholder="e.g. 8000"
              value={newDiet.steps} onChange={(e) => setNewDiet((p: any) => ({ ...p, steps: e.target.value }))} />
          </Field>
          <Field label={`Sleep (hrs) — target ${SLEEP_TARGET}h`}>
            <input style={inputStyle} type="number" inputMode="decimal" step="0.5" placeholder="e.g. 7.5"
              value={newDiet.sleep} onChange={(e) => setNewDiet((p: any) => ({ ...p, sleep: e.target.value }))} />
          </Field>
        </div>
        <Field label="Sleep Quality">
          <select style={selectStyle} value={newDiet.sleepQuality}
            onChange={(e) => setNewDiet((p: any) => ({ ...p, sleepQuality: e.target.value }))}>
            <option>Great</option><option>Good</option><option>Average</option><option>Poor</option>
          </select>
        </Field>
      </div>

      {/* Notes */}
      <Field label="Notes (optional)">
        <textarea style={{ ...inputStyle, height: 72, padding: "10px 12px", resize: "none" }}
          placeholder="Ate out, travel, stress, illness..."
          value={newDiet.notes} onChange={(e) => setNewDiet((p: any) => ({ ...p, notes: e.target.value }))} />
      </Field>

      {/* Save button */}
      <button
        onClick={saveDiet}
        disabled={dietLoading}
        style={{
          width: "100%", height: 48, borderRadius: 10, border: "none",
          background: dietLoading ? "var(--bg3)" : "var(--brand1)",
          color: dietLoading ? "var(--t3)" : "#fff",
          fontSize: 15, fontWeight: 800, cursor: dietLoading ? "not-allowed" : "pointer",
          transition: "all .15s",
        }}
      >
        {dietLoading ? "Saving..." : "💾 Save Habit Log"}
      </button>

      {/* Inline fallback messages (in case toast is missed) */}
      {dietSaved && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 8,
          background: "rgba(30,138,76,.1)", border: "1px solid rgba(30,138,76,.3)",
          fontSize: 13, fontWeight: 700, color: "var(--green)", textAlign: "center",
        }}>✓ Habit log saved successfully!</div>
      )}
      {dietError && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 8,
          background: "rgba(192,57,43,.1)", border: "1px solid rgba(192,57,43,.3)",
          fontSize: 13, fontWeight: 700, color: "var(--red)", textAlign: "center",
        }}>✕ {dietError}</div>
      )}
    </div>
  );

  // ── Empty state ───────────────────────────────────────────
  if (dh.length === 0) return (
    <>
      {dietSaved && <Toast message={`Habit log saved for ${dietClient}!`} type="success" />}
      {dietError && <Toast message={dietError} type="error" />}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--t1)" }}>Diet & Habits</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--t3)" }}>No logs yet — log the first entry below</p>
        </div>
        <select style={{ ...selectStyle, width: "auto", minWidth: 160 }}
          value={dietClient} onChange={(e) => setDietClient(e.target.value)}>
          {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{
        background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.2)",
        borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "var(--blue)",
      }}>
        📊 No habit logs for <strong>{dietClient || "this client"}</strong> yet. Start below.
      </div>

      <LogForm />
    </>
  );

  // ── Averages ──────────────────────────────────────────────
  const avgProtein = Math.round(dh.reduce((s: number, d: any) => s + n(d.protein), 0) / dh.length);
  const avgWater   = (dh.reduce((s: number, d: any) => s + n(d.water), 0) / dh.length).toFixed(1);
  const avgSteps   = Math.round(dh.reduce((s: number, d: any) => s + n(d.steps), 0) / dh.length);
  const avgSleep   = (dh.reduce((s: number, d: any) => s + n(d.sleep), 0) / dh.length).toFixed(1);

  return (
    <>
      {/* ── Toast ── */}
      {dietSaved && <Toast message={`Habit log saved for ${dietClient}!`} type="success" />}
      {dietError && <Toast message={dietError} type="error" />}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--t1)" }}>Diet & Habits</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--t3)" }}>
            {dh.length} logs · Protein · Water · Steps · Sleep
          </p>
        </div>
        <select style={{ ...selectStyle, width: "auto", minWidth: 160 }}
          value={dietClient} onChange={(e) => setDietClient(e.target.value)}>
          {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Avg Protein" value={`${avgProtein}g`} target={`Target: ${PROTEIN_TARGET}g`}
          pct={Math.min(100, Math.round(avgProtein / PROTEIN_TARGET * 100))} color="var(--brand1)" />
        <StatCard label="Avg Water" value={`${avgWater}L`} target={`Target: ${WATER_TARGET}L`}
          pct={Math.min(100, Math.round(Number(avgWater) / WATER_TARGET * 100))} color="var(--blue)" />
        <StatCard label="Avg Steps" value={n(avgSteps).toLocaleString()} target={`Target: ${STEPS_TARGET.toLocaleString()}`}
          pct={Math.min(100, Math.round(avgSteps / STEPS_TARGET * 100))} color="var(--green)" />
        <StatCard label="Avg Sleep" value={`${avgSleep}h`} target={`Target: ${SLEEP_TARGET}h`}
          pct={Math.min(100, Math.round(Number(avgSleep) / SLEEP_TARGET * 100))} color="var(--purple)" />
      </div>

      {/* ── Insights banner ── */}
      <div style={{ marginBottom: 20 }}>
        {avgProtein < PROTEIN_TARGET * 0.85 && (
          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 8, fontSize: 13,
            background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.2)", color: "var(--red)" }}>
            🥩 Protein averaging {avgProtein}g vs {PROTEIN_TARGET}g target. Discuss high-protein meal options.
          </div>
        )}
        {Number(avgSleep) < 7 && (
          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 8, fontSize: 13,
            background: "rgba(184,134,11,.08)", border: "1px solid rgba(184,134,11,.2)", color: "var(--yellow)" }}>
            😴 Sleep averaging {avgSleep}h — under 7h impairs recovery and performance.
          </div>
        )}
        {avgSteps < STEPS_TARGET * 0.7 && (
          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 8, fontSize: 13,
            background: "rgba(184,134,11,.08)", border: "1px solid rgba(184,134,11,.2)", color: "var(--yellow)" }}>
            🚶 Steps averaging {n(avgSteps).toLocaleString()} — below 7,000 target.
          </div>
        )}
        {avgProtein >= PROTEIN_TARGET * 0.9 && Number(avgSleep) >= 7 && avgSteps >= STEPS_TARGET * 0.8 && (
          <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13,
            background: "rgba(30,138,76,.08)", border: "1px solid rgba(30,138,76,.2)", color: "var(--green)" }}>
            ✓ All habits on track! Acknowledge this in the next session.
          </div>
        )}
      </div>

      {/* ── Two-column: form + charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 20 }}>

        {/* Log form */}
        <LogForm />

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Protein (g)", key: "protein", color: "var(--brand1)", avg: avgProtein, target: PROTEIN_TARGET },
            { label: "Sleep (hrs)", key: "sleep",   color: "var(--purple)", avg: Number(avgSleep), target: SLEEP_TARGET },
          ].map((chart) => (
            <div key={chart.key} style={{
              background: "var(--bg1)", border: "1px solid var(--b0)",
              borderRadius: 12, padding: "14px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}>{chart.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: chart.avg >= chart.target * 0.9 ? "rgba(30,138,76,.1)" : "rgba(192,57,43,.1)",
                  color: chart.avg >= chart.target * 0.9 ? "var(--green)" : "var(--red)",
                }}>Avg {chart.avg}{chart.key === "sleep" ? "h" : "g"}</span>
              </div>
              <LineChart data={dh.map((d: any) => n(d[chart.key]))} color={chart.color} />
            </div>
          ))}
        </div>
      </div>

      {/* ── History table ── */}
      <div style={{
        background: "var(--bg1)", border: "1px solid var(--b0)",
        borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--b0)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>Habit History</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
            background: "var(--bg3)", color: "var(--t3)",
          }}>{dh.length} entries</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bg2)" }}>
                {["Date","Protein","Water","Steps","Sleep","Quality","Notes"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--t4)", textTransform: "uppercase", letterSpacing: .5, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dh.slice().reverse().map((d: any, i: number) => (
                <tr key={i} style={{ borderTop: "1px solid var(--b0)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--t1)", whiteSpace: "nowrap" }}>{d.date}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontWeight: 700, color: n(d.protein) >= PROTEIN_TARGET * 0.9 ? "var(--green)" : "var(--red)" }}>{n(d.protein)}g</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontWeight: 700, color: n(d.water) >= WATER_TARGET * 0.9 ? "var(--green)" : "var(--yellow)" }}>{n(d.water)}L</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ color: n(d.steps) >= STEPS_TARGET * 0.8 ? "var(--green)" : "var(--yellow)" }}>{n(d.steps).toLocaleString()}</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ color: n(d.sleep) >= 7 ? "var(--green)" : "var(--yellow)" }}>{n(d.sleep)}h</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      background: d.sleepQuality === "Great" ? "rgba(30,138,76,.1)" : d.sleepQuality === "Good" ? "rgba(59,130,246,.1)" : d.sleepQuality === "Average" ? "rgba(184,134,11,.1)" : "rgba(192,57,43,.1)",
                      color: d.sleepQuality === "Great" ? "var(--green)" : d.sleepQuality === "Good" ? "var(--blue)" : d.sleepQuality === "Average" ? "var(--yellow)" : "var(--red)",
                    }}>{d.sleepQuality || "—"}</span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--t3)", fontSize: 11, maxWidth: 160 }}>{d.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
