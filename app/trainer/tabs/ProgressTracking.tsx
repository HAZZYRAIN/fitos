"use client";
import { useTrainer } from "../TrainerContext";
import { LineChart } from "../../components/ui/Charts";

export default function ProgressTracking() {
  const {
    myClients, progressClient, setProgressClient,
    progressTab, setProgressTab,
    showLogProgress, setShowLogProgress,
    progressSaved, newProgress, setNewProgress,
    progressHistory, saveProgress,
  } = useTrainer();

  const ph = progressHistory[progressClient] || progressHistory[Object.keys(progressHistory)[0]] || [];

  if (ph.length === 0) return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Progress Tracking</h2><p>No progress logs yet for this client</p></div>
        <select className="fi" style={{ width: "auto" }} value={progressClient} onChange={(e) => setProgressClient(e.target.value)}>
          {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="alert al-b">No progress data yet. Log the first entry below.</div>
      <div className="card">
        <div className="ch"><span className="ct">Log First Progress Entry</span></div>
        <div className="g2">
          {[["weight","Weight (kg)"],["bf","Body Fat %"],["chest","Chest (cm)"],["waist","Waist (cm)"],["hips","Hips (cm)"],["arms","Arms (cm)"],["thighs","Thighs (cm)"],["squat","Squat (kg)"],["bench","Bench (kg)"],["deadlift","Deadlift (kg)"],["pullup","Pull-ups (reps)"]].map(([k, l]) => (
            <div key={k} className="field">
              <label>{l}</label>
              <input className="fi" type="number" value={(newProgress as any)[k]} onChange={(e) => setNewProgress((p: any) => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <button className="btn btn-p btn-s mt8" onClick={() => saveProgress()}>Save Progress Entry</button>
        {progressSaved && <div className="alert al-g mt8">✓ Progress saved!</div>}
      </div>
    </>
  );

  const first = ph[0], last = ph[ph.length - 1];

  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Progress Tracking</h2><p>{ph.length} entries · {progressClient}</p></div>
        <div className="row gap8">
          <select className="fi" style={{ width: "auto" }} value={progressClient} onChange={(e) => setProgressClient(e.target.value)}>
            {myClients.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-p btn-s" onClick={() => setShowLogProgress(!showLogProgress)}>+ Log Progress</button>
        </div>
      </div>

      {showLogProgress && (
        <div className="card">
          <div className="ch"><span className="ct">New Progress Entry</span><span className="badge by fs10">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
          <div className="g2">
            {[["weight","Weight (kg)"],["bf","Body Fat %"],["chest","Chest (cm)"],["waist","Waist (cm)"],["hips","Hips (cm)"],["arms","Arms (cm)"],["thighs","Thighs (cm)"],["squat","Squat (kg)"],["bench","Bench (kg)"],["deadlift","Deadlift (kg)"],["pullup","Pull-ups (reps)"]].map(([k, l]) => (
              <div key={k} className="field">
                <label>{l}</label>
                <input className="fi" type="number" placeholder={String((last as any)[k])} value={(newProgress as any)[k]} onChange={(e) => setNewProgress((p: any) => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button className="btn btn-p btn-s mt8" style={{ width: "100%" }} onClick={() => saveProgress(last)}>Save Progress Entry</button>
          {progressSaved && <div className="alert al-g mt8">✓ Progress saved!</div>}
        </div>
      )}

      <div className="g4">
        {[
          { l: "Current Weight", v: `${last.weight}kg`, sub: `Started: ${first.weight}kg`, delta: `${(last.weight - first.weight) > 0 ? "+" : ""}${(last.weight - first.weight).toFixed(1)}kg`, down: last.weight < first.weight, c: "var(--brand)" },
          { l: "Body Fat", v: `${last.bf}%`, sub: `Started: ${first.bf}%`, delta: `${(last.bf - first.bf) > 0 ? "+" : ""}${(last.bf - first.bf).toFixed(1)}%`, down: last.bf < first.bf, c: "var(--purple)" },
          { l: "Waist", v: `${last.waist}cm`, sub: `Started: ${first.waist}cm`, delta: `${last.waist - first.waist}cm`, down: last.waist < first.waist, c: "var(--blue)" },
          { l: "Squat 1RM", v: `${last.squat}kg`, sub: `Started: ${first.squat}kg`, delta: `+${last.squat - first.squat}kg`, down: false, c: "var(--green)" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
            <div className="ss">{s.sub}</div>
            <div className={`sd ${s.down || i === 3 ? "sup" : "sdn"}`}>{s.down || i === 3 ? "▲" : "▼"} {s.delta}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {[["overview","Overview"],["weight","Weight"],["measurements","Measurements"],["strength","Strength"]].map(([id, label]) => (
          <div key={id} className={`tab ${progressTab === id ? "on" : ""}`} onClick={() => setProgressTab(id)}>{label}</div>
        ))}
      </div>

      {progressTab === "overview" && (
        <div className="g2">
          <div className="card">
            <div className="ch"><span className="ct">Weight Journey</span><span className="badge bg">{Math.abs(last.weight - first.weight).toFixed(1)}kg {last.weight < first.weight ? "lost" : "gained"}</span></div>
            <LineChart data={ph.map((p: any) => p.weight)} color="var(--brand)" />
          </div>
          <div className="card">
            <div className="ch"><span className="ct">Strength Progress</span></div>
            <LineChart data={ph.map((p: any) => p.squat)} color="var(--green)" />
            <div className="row mt8 gap16">
              <span className="fs11 t3">Squat: <span className="tg fw7">{last.squat}kg</span></span>
              <span className="fs11 t3">Bench: <span className="tb fw7">{last.bench}kg</span></span>
              <span className="fs11 t3">Deadlift: <span className="tp fw7">{last.deadlift}kg</span></span>
            </div>
          </div>
          <div className="card">
            <div className="ch"><span className="ct">Progress Timeline</span></div>
            <div className="col gap4">
              {ph.slice().reverse().map((p: any, i: number) => (
                <div key={i} className="row" style={{ padding: "8px 0", borderBottom: "1px solid var(--b1)" }}>
                  <div className="ad" style={{ background: i === 0 ? "var(--brand)" : "var(--s4)", flexShrink: 0, marginTop: 0 }} />
                  <span className="fs11 fw6 t2" style={{ marginLeft: 8, minWidth: 60 }}>{p.date}</span>
                  <span className="fs11 t3">{p.weight}kg · {p.waist}cm waist · Squat {p.squat}kg</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="ch"><span className="ct">Body Measurements</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                { l: "Chest", k: "chest" },{ l: "Waist", k: "waist" },{ l: "Hips", k: "hips" },
                { l: "Arms", k: "arms" },{ l: "Thighs", k: "thighs" },{ l: "Body Fat", k: "bf", unit: "%" },
              ].map((m, i) => {
                const delta = (last as any)[m.k] - (first as any)[m.k];
                const good = m.k === "arms" ? delta > 0 : delta < 0;
                return (
                  <div key={i} className="card-sm" style={{ textAlign: "center", padding: "10px 8px" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)" }}>{(last as any)[m.k]}{m.unit || "cm"}</div>
                    <div className="fs10 t3 mt4">{m.l}</div>
                    <div className={`fs10 fw7 mt4 ${good ? "tg" : "tr"}`}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}{m.unit || "cm"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {progressTab === "weight" && (
        <div className="col gap14">
          <div className="card">
            <div className="ch"><span className="ct">Weight Over Time (kg)</span>
              <div className="row gap8"><span className="badge bo fs10">Start: {first.weight}kg</span><span className="badge bg fs10">Now: {last.weight}kg</span></div>
            </div>
            <LineChart data={ph.map((p: any) => p.weight)} color="var(--brand)" />
          </div>
          <div className="card">
            <div className="ch"><span className="ct">Body Fat %</span></div>
            <LineChart data={ph.map((p: any) => p.bf)} color="var(--purple)" />
          </div>
        </div>
      )}

      {progressTab === "measurements" && (
        <div className="col gap14">
          <div className="g2">
            {[
              { l: "Chest (cm)", k: "chest", c: "var(--brand)" },
              { l: "Waist (cm)", k: "waist", c: "var(--blue)" },
              { l: "Hips (cm)", k: "hips", c: "var(--purple)" },
              { l: "Arms (cm)", k: "arms", c: "var(--green)" },
            ].map((m, i) => {
              const delta = (last as any)[m.k] - (first as any)[m.k];
              const good = m.k === "arms" ? delta > 0 : delta < 0;
              return (
                <div key={i} className="card">
                  <div className="ch"><span className="ct">{m.l}</span><span className={`badge fs10 ${good ? "bg" : "br"}`}>{delta > 0 ? "+" : ""}{delta}cm</span></div>
                  <LineChart data={ph.map((p: any) => (p as any)[m.k])} color={m.c} />
                  <div className="row mt8">
                    <span className="fs11 t3">Start: {(first as any)[m.k]}cm</span>
                    <span className="fs11 fw7 mla" style={{ color: m.c }}>Now: {(last as any)[m.k]}cm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {progressTab === "strength" && (
        <div className="col gap14">
          <div className="g2">
            {[
              { l: "Squat (kg)", k: "squat", c: "var(--green)" },
              { l: "Bench Press (kg)", k: "bench", c: "var(--brand)" },
              { l: "Deadlift (kg)", k: "deadlift", c: "var(--purple)" },
              { l: "Pull-ups (reps)", k: "pullup", c: "var(--blue)" },
            ].map((m, i) => {
              const delta = (last as any)[m.k] - (first as any)[m.k];
              return (
                <div key={i} className="card">
                  <div className="ch"><span className="ct">{m.l}</span><span className="badge bg fs10">+{delta}{m.k === "pullup" ? " reps" : "kg"}</span></div>
                  <LineChart data={ph.map((p: any) => (p as any)[m.k])} color={m.c} />
                  <div className="row mt8">
                    <span className="fs11 t3">Start: {(first as any)[m.k]}</span>
                    <span className="fs11 fw7 mla" style={{ color: m.c }}>Now: {(last as any)[m.k]}{m.k === "pullup" ? " reps" : "kg"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
