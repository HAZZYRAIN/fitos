"use client";
import { useAdmin } from "../AdminContext";

export default function Instructions() {
  const { instructions, deleteInstruction, setShowInstruction } = useAdmin();

  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Instructions Feed</h2><p>Trainers see this — they can't say "I didn't know"</p></div>
        <button className="btn btn-p btn-s" onClick={() => setShowInstruction(true)}>+ Post Instruction</button>
      </div>
      <div className="col gap12">
        {instructions.map((ins) => (
          <div key={ins.id} className="card" style={{ borderLeft: `3px solid ${ins.priority === "high" ? "var(--red)" : ins.priority === "medium" ? "var(--yellow)" : "var(--blue)"}` }}>
            <div className="row mb8">
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{ins.title}</span>
              <span className={`badge fs10 mla ${ins.priority === "high" ? "br" : ins.priority === "medium" ? "by" : "bb"}`}>{ins.priority}</span>
              <span className="fs11 t3" style={{ marginLeft: 10 }}>{ins.date} · {ins.by}</span>
            </div>
            <div className="fs13 t2">{ins.body}</div>
            <div className="row mt12 gap8">
              <button className="btn btn-dn btn-xs" onClick={() => deleteInstruction(ins.id)}>Delete</button>
            </div>
          </div>
        ))}
        {instructions.length === 0 && <div className="alert al-b">No instructions posted yet.</div>}
      </div>
    </>
  );
}
