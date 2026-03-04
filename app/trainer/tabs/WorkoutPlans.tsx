"use client";
// ============================================================
// WORKOUT PLANS — FIXED
// Fix: "Use Template" button now sets session type + navigates to Log tab
// Note: To inject actual exercises, add an "exercises" array to each
//       template doc in Firestore with { name, muscles, equipment, level }
// ============================================================
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useTrainer } from "../TrainerContext";

interface Template {
  id: string;
  name: string;
  category: string;
  level: string;
  days: string;
  duration: string;
  description: string;
  status: "active" | "archived";
  exercises?: { name: string; muscles: string; equipment: string; level: string }[];
}

const categoryColor: Record<string, string> = {
  "Fat Loss": "by",
  "Strength": "bo",
  "Mobility": "bb",
  "Performance": "bp",
  "Rehab": "bg",
  "HIIT": "br",
  "Muscle Gain": "bp",
};

export default function WorkoutPlans() {
  const { setSessionExercises, setSessionType, setTab } = useTrainer();
  const [templates, setTemplates]   = useState<Template[]>([]);
  const [loading, setLoading]       = useState(true);
  const [usedId, setUsedId]         = useState<string | null>(null); // tracks which was just used

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "templates"), orderBy("createdAt", "desc")),
      (snap) => {
        setTemplates(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Template))
            .filter((t) => t.status === "active")
        );
        setLoading(false);
      },
      (err) => {
        console.error("templates listener error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleUseTemplate = (t: Template) => {
    // If template has exercises saved in Firestore, inject them
    if (t.exercises && t.exercises.length > 0) {
      setSessionExercises(
        t.exercises.map((e) => ({
          ...e,
          sets: "3",
          reps: "10",
          weight: "0",
        }))
      );
    }
    // Set the session type to match template category
    const typeMap: Record<string, string> = {
      "Fat Loss": "HIIT",
      "Strength": "Strength Training",
      "Mobility": "Mobility",
      "Performance": "Strength Training",
      "Rehab": "Rehab",
      "HIIT": "HIIT",
      "Muscle Gain": "Strength Training",
      "Cardio": "Cardio",
    };
    setSessionType(typeMap[t.category] || "Strength Training");
    setUsedId(t.id);
    // Brief visual confirmation then navigate
    setTimeout(() => {
      setTab("log");
      setUsedId(null);
    }, 600);
  };

  return (
    <>
      <div className="sh">
        <div className="sh-l">
          <h2>Workout Plans</h2>
          <p>Admin-approved templates — tap Use to load into Log Session</p>
        </div>
      </div>

      {loading && <div className="alert al-b">Loading templates...</div>}

      {!loading && templates.length === 0 && (
        <div className="alert al-b">
          No templates yet. Ask admin to add templates from the Admin panel → Workout Templates tab.
        </div>
      )}

      <div className="col gap12">
        {templates.map((t) => (
          <div key={t.id} className="card">
            <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="row gap8 mb8" style={{ flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                  <span className={`badge fs10 ${categoryColor[t.category] || "bgr"}`}>{t.category}</span>
                  <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                </div>
                {t.description && (
                  <div className="fs12 t2 mb8">{t.description}</div>
                )}
                <div className="row gap16">
                  <span className="fs11 t3">📅 {t.days}</span>
                  <span className="fs11 t3">⏱ {t.duration}</span>
                  {t.exercises && t.exercises.length > 0 && (
                    <span className="fs11 t3">🏋 {t.exercises.length} exercises</span>
                  )}
                </div>
              </div>
              {/* FIXED: Use Template now actually works */}
              <button
                className={`btn btn-s ${usedId === t.id ? "btn-ok" : "btn-p"}`}
                style={{ flexShrink: 0, minWidth: 90 }}
                onClick={() => handleUseTemplate(t)}
                disabled={usedId === t.id}
              >
                {usedId === t.id ? "✓ Loading..." : "Use Template"}
              </button>
            </div>

            {/* Show exercises preview if available */}
            {t.exercises && t.exercises.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--b1)" }}>
                <div className="fs10 t3 mb8" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Exercises</div>
                <div className="col gap4">
                  {t.exercises.slice(0, 4).map((ex, i) => (
                    <div key={i} className="row gap8">
                      <span className="fs12 t2 fw6" style={{ flex: 1 }}>{ex.name}</span>
                      <span className="fs11 t3">{ex.muscles}</span>
                    </div>
                  ))}
                  {t.exercises.length > 4 && (
                    <div className="fs11 t3">+{t.exercises.length - 4} more exercises</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
