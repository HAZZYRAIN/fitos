"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

interface Template {
  id: string;
  name: string;
  category: string;
  level: string;
  days: string;
  duration: string;
  description: string;
  status: "active" | "archived";
}

export default function WorkoutPlans() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "templates"), orderBy("createdAt", "desc")), (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template)).filter((t) => t.status === "active"));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categoryColor: Record<string, string> = { "Fat Loss": "by", "Strength": "bo", "Mobility": "bb", "Performance": "bp", "Rehab": "bg", "HIIT": "br", "Muscle Gain": "bp" };

  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Workout Plans</h2><p>Admin-approved templates — use these or build your own</p></div>
      </div>

      {loading && <div className="alert al-b">Loading templates...</div>}

      {!loading && templates.length === 0 && (
        <div className="alert al-b">No templates available yet. Admin will add them soon.</div>
      )}

      <div className="col gap12">
        {templates.map((t) => (
          <div key={t.id} className="card">
            <div className="row">
              <div style={{ flex: 1 }}>
                <div className="row gap12 mb8">
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                  <span className={`badge fs10 ${categoryColor[t.category] || "bgr"}`}>{t.category}</span>
                  <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                </div>
                {t.description && <div className="fs12 t2 mb8">{t.description}</div>}
                <div className="row gap16">
                  <span className="fs11 t3">📅 {t.days}</span>
                  <span className="fs11 t3">⏱ {t.duration}</span>
                </div>
              </div>
              <button className="btn btn-p btn-s">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
