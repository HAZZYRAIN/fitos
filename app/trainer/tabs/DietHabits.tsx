"use client";
import { useTrainer } from "../TrainerContext";
import { LineChart } from "../../components/ui/Charts";

const PROTEIN_TARGET = 120, WATER_TARGET = 3.0, STEPS_TARGET = 10000, SLEEP_TARGET = 8;

export default function DietHabits() {
  const {
    myClients, dietClient, setDietClient,
    dietSaved, newDiet, setNewDiet,
    dietHistory, saveDiet,
  } = useTrainer();

  const dh = dietHistory[dietClient] || dietHistory[Object.keys(dietHistory)[0]] || [];

  if (dh.length === 0) return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Diet & Habit Notes</h2><p>No logs yet</p></div>
        <select className="fi" style={{ width: "auto" }} value={dietClient} onChange={(e) => setDietClient(e.target.value)}>
          {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="alert al-b">No habit logs for {dietClient} yet. Log the first entry below.</div>
      <div className="card">
        <div className="ch"><span className="ct">Log Today's Habits</span></div>
        <div className="g2">
          <div className="field"><label>Protein (g)</label><input className="fi" type="number" placeholder={`Target: ${PROTEIN_TARGET}g`} value={newDiet.protein} onChange={(e) => setNewDiet((p: any) => ({ ...p, protein: e.target.value }))} /></div>
          <div className="field"><label>Water (Litres)</label><input className="fi" type="number" step="0.1" placeholder={`Target: ${WATER_TARGET}L`} value={newDiet.water} onChange={(e) => setNewDiet((p: any) => ({ ...p, water: e.target.value }))} /></div>
          <div className="field"><label>Steps</label><input className="fi" type="number" placeholder={`Target: ${STEPS_TARGET}`} value={newDiet.steps} onChange={(e) => setNewDiet((p: any) => ({ ...p, steps: e.target.value }))} /></div>
          <div className="field"><label>Sleep (hours)</label><input className="fi" type="number" step="0.5" placeholder={`Target: ${SLEEP_TARGET}h`} value={newDiet.sleep} onChange={(e) => setNewDiet((p: any) => ({ ...p, sleep: e.target.value }))} /></div>
        </div>
        <div className="field"><label>Sleep Quality</label><select className="fi" value={newDiet.sleepQuality} onChange={(e) => setNewDiet((p: any) => ({ ...p, sleepQuality: e.target.value }))}><option>Great</option><option>Good</option><option>Average</option><option>Poor</option></select></div>
        <div className="field"><label>Notes (optional)</label><textarea className="fi" rows={2} placeholder="Ate out, stress, travel..." value={newDiet.notes} onChange={(e) => setNewDiet((p: any) => ({ ...p, notes: e.target.value }))} style={{ resize: "none" }} /></div>
        <button className="btn btn-p btn-s mt8" style={{ width: "100%" }} onClick={saveDiet}>Save Habit Log</button>
        {dietSaved && <div className="alert al-g mt8">✓ Habit log saved!</div>}
      </div>
    </>
  );

  const avgProtein = Math.round(dh.reduce((s: number, d: any) => s + d.protein, 0) / dh.length);
  const avgWater = (dh.reduce((s: number, d: any) => s + d.water, 0) / dh.length).toFixed(1);
  const avgSteps = Math.round(dh.reduce((s: number, d: any) => s + d.steps, 0) / dh.length);
  const avgSleep = (dh.reduce((s: number, d: any) => s + d.sleep, 0) / dh.length).toFixed(1);

  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Diet & Habit Notes</h2><p>Protein · Water · Steps · Sleep</p></div>
        <select className="fi" style={{ width: "auto" }} value={dietClient} onChange={(e) => setDietClient(e.target.value)}>
          {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>
      {dietSaved && <div className="alert al-g">✓ Habit log saved for {dietClient}</div>}
      <div className="g4">
        {[
          { l: "Avg Protein", v: `${avgProtein}g`, target: `Target: ${PROTEIN_TARGET}g`, pct: Math.round(avgProtein / PROTEIN_TARGET * 100), c: "var(--brand)" },
          { l: "Avg Water", v: `${avgWater}L`, target: `Target: ${WATER_TARGET}L`, pct: Math.round(Number(avgWater) / WATER_TARGET * 100), c: "var(--blue)" },
          { l: "Avg Steps", v: avgSteps.toLocaleString(), target: `Target: ${STEPS_TARGET.toLocaleString()}`, pct: Math.round(avgSteps / STEPS_TARGET * 100), c: "var(--green)" },
          { l: "Avg Sleep", v: `${avgSleep}h`, target: `Target: ${SLEEP_TARGET}h`, pct: Math.round(Number(avgSleep) / SLEEP_TARGET * 100), c: "var(--purple)" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c, fontSize: 26 }}>{s.v}</div>
            <div className="ss">{s.target}</div>
            <div className="pw mt8"><div className={`pb ${s.pct >= 90 ? "pb-g" : s.pct >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${Math.min(100, s.pct)}%` }} /></div>
            <div className={`fs10 fw7 mt4 ${s.pct >= 90 ? "tg" : s.pct >= 70 ? "ty" : "tr"}`}>{s.pct}% of target</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">Log Today's Habits</span><span className="badge by fs10">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
          <div className="g2">
            <div className="field"><label>Protein (g)</label><input className="fi" type="number" placeholder={`Target: ${PROTEIN_TARGET}g`} value={newDiet.protein} onChange={(e) => setNewDiet((p: any) => ({ ...p, protein: e.target.value }))} /></div>
            <div className="field"><label>Water (Litres)</label><input className="fi" type="number" step="0.1" placeholder={`Target: ${WATER_TARGET}L`} value={newDiet.water} onChange={(e) => setNewDiet((p: any) => ({ ...p, water: e.target.value }))} /></div>
            <div className="field"><label>Steps</label><input className="fi" type="number" placeholder={`Target: ${STEPS_TARGET}`} value={newDiet.steps} onChange={(e) => setNewDiet((p: any) => ({ ...p, steps: e.target.value }))} /></div>
            <div className="field"><label>Sleep (hours)</label><input className="fi" type="number" step="0.5" placeholder={`Target: ${SLEEP_TARGET}h`} value={newDiet.sleep} onChange={(e) => setNewDiet((p: any) => ({ ...p, sleep: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Sleep Quality</label><select className="fi" value={newDiet.sleepQuality} onChange={(e) => setNewDiet((p: any) => ({ ...p, sleepQuality: e.target.value }))}><option>Great</option><option>Good</option><option>Average</option><option>Poor</option></select></div>
          <div className="field"><label>Notes (optional)</label><textarea className="fi" rows={2} placeholder="Ate out, stress, travel, period, illness..." value={newDiet.notes} onChange={(e) => setNewDiet((p: any) => ({ ...p, notes: e.target.value }))} style={{ resize: "none" }} /></div>
          <button className="btn btn-p btn-s mt8" style={{ width: "100%" }} onClick={saveDiet}>Save Habit Log</button>
        </div>
        <div className="col gap14">
          <div className="card">
            <div className="ch"><span className="ct">Protein (g) — Trend</span><span className={`badge fs10 ${avgProtein >= PROTEIN_TARGET ? "bg" : avgProtein >= PROTEIN_TARGET * 0.8 ? "by" : "br"}`}>Avg {avgProtein}g</span></div>
            <LineChart data={dh.map((d: any) => d.protein)} color="var(--brand)" />
          </div>
          <div className="card">
            <div className="ch"><span className="ct">Sleep (hours)</span><span className={`badge fs10 ${Number(avgSleep) >= 7 ? "bg" : "by"}`}>Avg {avgSleep}h</span></div>
            <LineChart data={dh.map((d: any) => d.sleep)} color="var(--purple)" />
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px 0" }}><span className="ct">7-Day Habit Log</span></div>
        <div className="tw">
          <table>
            <thead><tr><th>Date</th><th>Protein</th><th>Water</th><th>Steps</th><th>Sleep</th><th>Quality</th><th>Notes</th></tr></thead>
            <tbody>
              {dh.slice().reverse().map((d: any, i: number) => (
                <tr key={i}>
                  <td className="fw6">{d.date}</td>
                  <td><span className={d.protein >= PROTEIN_TARGET * 0.9 ? "tg fw7" : "tr fw7"}>{d.protein}g</span></td>
                  <td><span className={d.water >= WATER_TARGET * 0.9 ? "tg fw7" : "ty fw7"}>{d.water}L</span></td>
                  <td><span className={d.steps >= STEPS_TARGET * 0.8 ? "tg" : "ty"}>{d.steps.toLocaleString()}</span></td>
                  <td><span className={d.sleep >= 7 ? "tg" : "ty"}>{d.sleep}h</span></td>
                  <td><span className={`badge fs10 ${d.sleepQuality === "Great" ? "bg" : d.sleepQuality === "Good" ? "bb" : d.sleepQuality === "Average" ? "by" : "br"}`}>{d.sleepQuality}</span></td>
                  <td className="fs11 t3">{d.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="ch"><span className="ct">Trainer Insights</span><span className="badge bb fs10">Auto-generated</span></div>
        <div className="col gap8">
          {avgProtein < PROTEIN_TARGET * 0.85 && <div className="alert al-r">🥩 Protein averaging {avgProtein}g vs {PROTEIN_TARGET}g target. Discuss high-protein meals.</div>}
          {Number(avgSleep) < 7 && <div className="alert al-y">😴 Sleep averaging {avgSleep}h. Below 7h impairs recovery.</div>}
          {avgSteps < STEPS_TARGET * 0.7 && <div className="alert al-y">🚶 Steps averaging {avgSteps.toLocaleString()} vs 10,000 target.</div>}
          {avgProtein >= PROTEIN_TARGET * 0.9 && Number(avgSleep) >= 7 && avgSteps >= STEPS_TARGET * 0.8 && <div className="alert al-g">✓ All habits on track this week. Acknowledge this in next session.</div>}
        </div>
      </div>
    </>
  );
}
