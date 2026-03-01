"use client";
import { useTrainer } from "../TrainerContext";

export default function TrainerInstructions() {
  const { myInstructions } = useTrainer();

  return (
    <>
      <div className="sh"><div className="sh-l"><h2>Instructions from Admin</h2><p>Read all high-priority items</p></div></div>
      <div className="col gap12">
        {myInstructions.map((ins) => (
          <div key={ins.id} className="card" style={{ borderLeft: `3px solid ${ins.priority === "high" ? "var(--red)" : ins.priority === "medium" ? "var(--yellow)" : "var(--blue)"}` }}>
            <div className="row mb8">
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{ins.title}</span>
              <span className={`badge fs10 mla ${ins.priority === "high" ? "br" : ins.priority === "medium" ? "by" : "bb"}`}>{ins.priority}</span>
              <span className="fs11 t3" style={{ marginLeft: 10 }}>{ins.date}</span>
            </div>
            <div className="fs13 t2">{ins.body}</div>
            {ins.priority === "high" && <button className="btn btn-ok btn-xs mt12">✓ Mark as Read</button>}
          </div>
        ))}
        {myInstructions.length === 0 && <div className="alert al-b">No instructions from admin yet.</div>}
      </div>
    </>
  );
}
