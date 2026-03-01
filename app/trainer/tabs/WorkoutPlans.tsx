"use client";
import { APPROVED_TEMPLATES } from "../../data/templates";

export default function WorkoutPlans() {
  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Workout Plans</h2><p>Use admin-approved templates where possible</p></div>
        <div className="row gap8"><button className="btn btn-g btn-s">+ Diet Plan</button><button className="btn btn-p btn-s">+ Workout Plan</button></div>
      </div>
      <div className="col gap12">
        {APPROVED_TEMPLATES.map((t) => (
          <div key={t.id} className="card">
            <div className="row">
              <div style={{ flex: 1 }}>
                <div className="row gap12 mb8">
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                  <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                </div>
                <div className="fs12 t2 mb8">{t.description}</div>
                <div className="row gap16"><span className="fs11 t3">📅 {t.days}</span><span className="fs11 t3">⏱ {t.duration}</span><span className="fs11 t3">🏋 {t.exercises} exercises</span></div>
              </div>
              <button className="btn btn-p btn-s">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
