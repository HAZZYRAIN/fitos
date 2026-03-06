"use client";
// ============================================================
// WORKOUT PLANS — v3
// Changes:
// - Only shows templates assigned to this trainer (assignedTo contains uid)
// - Day-by-day expandable plan view
// - "Use Day" button pre-fills that day's exercises into Log Session
// ============================================================
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useTrainer } from "../TrainerContext";

interface ExEntry {
  name: string;
  muscles: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

interface WorkoutDay {
  dayLabel: string;
  focus: string;
  exercises: ExEntry[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  level: string;
  days: string;
  duration: string;
  description: string;
  status: "active" | "archived";
  assignedTo?: string[];
  workoutDays?: WorkoutDay[];
}

const categoryColor: Record<string, string> = {
  "Fat Loss": "by", "Strength": "bo", "Mobility": "bb",
  "Performance": "bp", "Rehab": "bg", "HIIT": "br", "Muscle Gain": "bp",
};

const typeMap: Record<string, string> = {
  "Fat Loss": "HIIT", "Strength": "Strength Training",
  "Mobility": "Mobility", "Performance": "Strength Training",
  "Rehab": "Rehab", "HIIT": "HIIT", "Muscle Gain": "Strength Training",
};

export default function WorkoutPlans() {
  const { uid, setSessionExercises, setSessionType, setTab } = useTrainer();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usedDayKey, setUsedDayKey] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("All");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "templates"), orderBy("createdAt", "desc")),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template));
        // Only show active templates assigned to this trainer
        setTemplates(all.filter((t) => t.status === "active" && (t.assignedTo || []).includes(uid)));
        setLoading(false);
      },
      (err) => { console.error("templates:", err); setLoading(false); }
    );
    return () => unsub();
  }, [uid]);

  // Pre-fill a specific day's exercises into Log Session
  const useDay = (t: Template, day: WorkoutDay, key: string) => {
    setSessionExercises(
      day.exercises.map((e) => ({
        name: e.name,
        muscles: e.muscles,
        sets: e.sets || "3",
        reps: e.reps || "10",
        weight: "0",
        notes: e.notes || "",
      }))
    );
    setSessionType(typeMap[t.category] || "Strength Training");
    setUsedDayKey(key);
    setTimeout(() => {
      setTab("log");
      setUsedDayKey(null);
    }, 700);
  };

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const visible = catFilter === "All" ? templates : templates.filter((t) => t.category === catFilter);

  return (
    <>
      <style>{`
        .wp-card {
          background: var(--bg1);
          border: 1px solid var(--b0);
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow .15s;
        }
        .wp-card:hover { box-shadow: 0 4px 16px rgba(201,168,76,.1); }
        .wp-card-head {
          padding: 14px 16px 12px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          cursor: pointer;
        }
        .wp-day-block {
          border-top: 1px solid var(--b0);
          padding: 12px 16px;
          background: var(--bg2);
        }
        .wp-day-block + .wp-day-block {
          border-top: 1px solid var(--b0);
        }
        .wp-day-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .wp-day-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--brand1);
          background: rgba(201,168,76,.1);
          border: 1px solid rgba(201,168,76,.22);
          padding: 2px 9px;
          border-radius: 5px;
        }
        .wp-day-focus {
          font-size: 12px;
          font-weight: 700;
          color: var(--t1);
          flex: 1;
        }
        .wp-ex-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .wp-ex-table th {
          text-align: left;
          font-size: 9px;
          font-weight: 700;
          color: var(--t4);
          text-transform: uppercase;
          letter-spacing: .5px;
          padding: 0 8px 5px 0;
        }
        .wp-ex-table td {
          padding: 5px 8px 5px 0;
          color: var(--t2);
          border-top: 1px solid var(--b0);
          vertical-align: middle;
        }
        .wp-ex-table tr:first-child td { border-top: none; }
        .wp-ex-name { font-weight: 600; color: var(--t1) !important; }
        .wp-ex-muscles { color: var(--t4) !important; font-size: 10px !important; }
        .wp-use-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 7px;
          border: 1.5px solid rgba(201,168,76,.35);
          background: rgba(201,168,76,.08);
          color: var(--brand1);
          cursor: pointer;
          transition: background .15s, border-color .15s;
          white-space: nowrap;
        }
        .wp-use-btn:hover { background: rgba(201,168,76,.16); border-color: var(--brand1); }
        .wp-use-btn.used {
          background: rgba(46,160,67,.12);
          border-color: rgba(46,160,67,.4);
          color: #2ea043;
        }
        .wp-filter-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 12px;
        }
        .wp-filter-row::-webkit-scrollbar { height: 3px; }
        .wp-filter-row::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 2px; }
        .wp-chevron {
          font-size: 13px;
          color: var(--t3);
          transition: transform .2s;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .wp-chevron.open { transform: rotate(180deg); }
        .wp-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 6px; }
        .wp-meta span { font-size: 11px; color: var(--t3); }
      `}</style>

      {/* Header */}
      <div className="sh">
        <div className="sh-l">
          <h2>Workout Plans</h2>
          <p>Templates assigned to you — tap a day to use it in Log Session</p>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="alert al-b">Loading your templates...</div>}

      {/* Empty state */}
      {!loading && templates.length === 0 && (
        <div className="alert al-b" style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div className="fs13 fw7 t1 mb4">No templates assigned yet</div>
          <div className="fs12 t3">Ask your admin to assign workout templates to you from the Admin panel.</div>
        </div>
      )}

      {/* Category filter */}
      {!loading && templates.length > 0 && (
        <div className="wp-filter-row">
          {categories.map((c) => (
            <div key={c} className={`tab ${catFilter === c ? "on" : ""}`}
              onClick={() => setCatFilter(c)} style={{ flexShrink: 0 }}>{c}</div>
          ))}
        </div>
      )}

      {/* No results in category */}
      {!loading && templates.length > 0 && visible.length === 0 && (
        <div className="alert al-b">No templates in this category.</div>
      )}

      {/* Template cards */}
      <div className="col gap12">
        {visible.map((t) => {
          const isOpen = expandedId === t.id;
          const dayCount = (t.workoutDays || []).length;
          const exCount = (t.workoutDays || []).reduce((s, d) => s + d.exercises.length, 0);

          return (
            <div key={t.id} className="wp-card">
              {/* Card header — click to expand */}
              <div className="wp-card-head" onClick={() => setExpandedId(isOpen ? null : t.id)}>
                <div style={{ flex: 1 }}>
                  {/* Badges */}
                  <div className="row gap6 mb6" style={{ flexWrap: "wrap" }}>
                    <span className={`badge fs10 ${categoryColor[t.category] || "bgr"}`}>{t.category}</span>
                    <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                    {dayCount > 0 && <span className="badge bb fs10">📋 {dayCount} days</span>}
                  </div>

                  {/* Name */}
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)", lineHeight: 1.3 }}>{t.name}</div>

                  {/* Description */}
                  {t.description && (
                    <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, lineHeight: 1.5 }}>{t.description}</div>
                  )}

                  {/* Meta */}
                  <div className="wp-meta">
                    <span>📅 {t.days}</span>
                    <span>⏱ {t.duration}</span>
                    {exCount > 0 && <span>🏋 {exCount} total exercises</span>}
                  </div>
                </div>

                {/* Chevron */}
                <div className={`wp-chevron ${isOpen ? "open" : ""}`}>▼</div>
              </div>

              {/* Day-by-day plan */}
              {isOpen && (
                <>
                  {dayCount === 0 ? (
                    <div className="wp-day-block">
                      <div className="fs12 t3" style={{ textAlign: "center", padding: "8px 0" }}>
                        No workout days added to this template yet.
                      </div>
                    </div>
                  ) : (
                    (t.workoutDays || []).map((day, di) => {
                      const key = `${t.id}-${di}`;
                      const isUsed = usedDayKey === key;
                      return (
                        <div key={di} className="wp-day-block">
                          {/* Day header row */}
                          <div className="wp-day-header">
                            <span className="wp-day-label">{day.dayLabel}</span>
                            {day.focus && <span className="wp-day-focus">{day.focus}</span>}
                            {day.exercises.length > 0 && (
                              <button
                                className={`wp-use-btn ${isUsed ? "used" : ""}`}
                                disabled={isUsed}
                                onClick={(e) => { e.stopPropagation(); useDay(t, day, key); }}
                              >
                                {isUsed ? "✓ Loading..." : "▶ Use This Day"}
                              </button>
                            )}
                          </div>

                          {/* Exercise table */}
                          {day.exercises.length > 0 ? (
                            <table className="wp-ex-table">
                              <thead>
                                <tr>
                                  <th>Exercise</th>
                                  <th>Muscles</th>
                                  <th>Sets</th>
                                  <th>Reps</th>
                                  <th>Rest</th>
                                  <th>Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {day.exercises.map((ex, ei) => (
                                  <tr key={ei}>
                                    <td className="wp-ex-name">{ex.name}</td>
                                    <td className="wp-ex-muscles">{ex.muscles}</td>
                                    <td style={{ fontWeight: 600 }}>{ex.sets}</td>
                                    <td style={{ fontWeight: 600 }}>{ex.reps}</td>
                                    <td>{ex.rest || "—"}</td>
                                    <td style={{ color: "var(--t4)", fontSize: 10 }}>{ex.notes || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="fs11 t4">No exercises in this day.</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
