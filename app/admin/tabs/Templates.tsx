"use client";
import { APPROVED_TEMPLATES } from "../../data/templates";

export default function Templates() {
  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Workout Templates</h2><p>Admin-approved — trainers choose from these</p></div>
        <button className="btn btn-p btn-s">+ Create Template</button>
      </div>
      <div className="col gap12">
        {APPROVED_TEMPLATES.map((t) => (
          <div key={t.id} className="card">
            <div className="row">
              <div style={{ flex: 1 }}>
                <div className="row gap12 mb8">
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                  <span className={`badge fs10 ${t.category === "Fat Loss" ? "by" : t.category === "Strength" ? "bo" : t.category === "Rehab" ? "bb" : t.category === "Performance" ? "bp" : "bg"}`}>{t.category}</span>
                  <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                </div>
                <div className="fs12 t2 mb8">{t.description}</div>
                <div className="row gap16"><span className="fs11 t3">📅 {t.days}</span><span className="fs11 t3">⏱ {t.duration}</span><span className="fs11 t3">🏋 {t.exercises} exercises</span></div>
              </div>
              <div className="row gap8">
                <button className="btn btn-g btn-s">Edit</button>
                <button className="btn btn-g btn-s">View</button>
                <button className="btn btn-dn btn-xs">Deactivate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
