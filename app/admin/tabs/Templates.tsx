"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, orderBy, query, serverTimestamp
} from "firebase/firestore";
import { useAdmin } from "../AdminContext";

interface Template {
  id: string;
  name: string;
  category: string;
  level: string;
  days: string;
  duration: string;
  description: string;
  status: "active" | "archived";
  assignedTo?: string[];   // trainer IDs
  createdAt?: any;
}

const EMPTY_FORM = {
  name: "", category: "Fat Loss", level: "Beginner",
  days: "", duration: "", description: ""
};

const PREMADE: Omit<Template, "id" | "status" | "createdAt">[] = [
  {
    name: "Beginner Fat Loss Kickstart",
    category: "Fat Loss", level: "Beginner",
    days: "3x / week", duration: "40 min",
    description: "Full-body circuits for beginners. Cardio + bodyweight moves to ignite metabolism. Perfect for clients just starting their fitness journey.",
    assignedTo: [],
  },
  {
    name: "Intermediate Fat Loss Shred",
    category: "Fat Loss", level: "Intermediate",
    days: "4x / week", duration: "50 min",
    description: "Superset-based training with moderate weights and cardio finishers. Targets stubborn fat with progressive overload.",
    assignedTo: [],
  },
  {
    name: "Advanced Fat Burn & Maintain",
    category: "Fat Loss", level: "Advanced",
    days: "5x / week", duration: "60 min",
    description: "High-intensity resistance + HIIT hybrid. Designed for clients near goal weight who want to stay lean and build shape.",
    assignedTo: [],
  },
  {
    name: "Beginner Strength Foundation",
    category: "Strength", level: "Beginner",
    days: "3x / week", duration: "45 min",
    description: "Teaches the 5 fundamental movement patterns — squat, hinge, push, pull, carry. Barbell and dumbbell basics with form focus.",
    assignedTo: [],
  },
  {
    name: "Intermediate Strength Builder",
    category: "Strength", level: "Intermediate",
    days: "4x / week", duration: "55 min",
    description: "Upper/Lower split with progressive overload protocol. Compound lifts focused. Ideal for clients who have 6+ months of training.",
    assignedTo: [],
  },
  {
    name: "Advanced Powerlifting Program",
    category: "Strength", level: "Advanced",
    days: "4x / week", duration: "75 min",
    description: "Periodised program built around squat, bench and deadlift. Includes accessory work and deload weeks. For serious strength athletes.",
    assignedTo: [],
  },
  {
    name: "Beginner Muscle Gain",
    category: "Muscle Gain", level: "Beginner",
    days: "3x / week", duration: "50 min",
    description: "Full-body hypertrophy plan with 8–12 rep ranges. Teaches mind-muscle connection and consistent volume for new lifters.",
    assignedTo: [],
  },
  {
    name: "Intermediate Muscle Gain (PPL)",
    category: "Muscle Gain", level: "Intermediate",
    days: "6x / week", duration: "60 min",
    description: "Push / Pull / Legs split twice a week. High volume hypertrophy protocol for clients chasing visible muscle growth.",
    assignedTo: [],
  },
  {
    name: "Advanced Mass & Symmetry",
    category: "Muscle Gain", level: "Advanced",
    days: "5x / week", duration: "70 min",
    description: "Body-part split with lagging muscle emphasis. Includes drop sets, rest-pause and mechanical tension techniques for advanced physique goals.",
    assignedTo: [],
  },
  {
    name: "Beginner HIIT & Conditioning",
    category: "HIIT", level: "Beginner",
    days: "3x / week", duration: "30 min",
    description: "Low-impact HIIT circuits using bodyweight. 30/30 work-rest intervals. Great for clients with limited time or returning after a break.",
    assignedTo: [],
  },
  {
    name: "Intermediate HIIT Bootcamp",
    category: "HIIT", level: "Intermediate",
    days: "4x / week", duration: "40 min",
    description: "High-energy interval training combining kettlebells, plyometrics and core work. Burns maximum calories in minimum time.",
    assignedTo: [],
  },
  {
    name: "Mobility & Flexibility Reset",
    category: "Mobility", level: "Beginner",
    days: "3x / week", duration: "35 min",
    description: "Yoga-inspired stretching + joint mobility work. Ideal for desk workers, seniors or clients recovering from tightness and poor posture.",
    assignedTo: [],
  },
  {
    name: "Intermediate Mobility & Strength",
    category: "Mobility", level: "Intermediate",
    days: "3x / week", duration: "45 min",
    description: "Combines functional movement patterns with mobility drills. Improves range of motion while building stability and body control.",
    assignedTo: [],
  },
  {
    name: "Post-Injury Rehab (Lower Body)",
    category: "Rehab", level: "Beginner",
    days: "3x / week", duration: "40 min",
    description: "Gentle lower body rehabilitation focusing on knees, hips and ankles. Approved movement patterns to rebuild strength safely after injury.",
    assignedTo: [],
  },
  {
    name: "Post-Injury Rehab (Upper Body)",
    category: "Rehab", level: "Beginner",
    days: "3x / week", duration: "35 min",
    description: "Shoulder, elbow and wrist rehabilitation protocol. Rotator cuff work, scapular stability and controlled loading progressions.",
    assignedTo: [],
  },
  {
    name: "Athletic Performance (Sport)",
    category: "Performance", level: "Advanced",
    days: "5x / week", duration: "65 min",
    description: "Speed, power and agility training for competitive athletes. Plyometrics, sprint work and sport-specific conditioning drills.",
    assignedTo: [],
  },
  {
    name: "Couple's Partner Workout",
    category: "Fat Loss", level: "Beginner",
    days: "3x / week", duration: "45 min",
    description: "Fun partner-based circuit training. Mirror exercises, partner resistance and motivation drills. Designed for couple program clients.",
    assignedTo: [],
  },
  {
    name: "Senior Fitness & Balance",
    category: "Mobility", level: "Beginner",
    days: "3x / week", duration: "35 min",
    description: "Low-impact functional training for 55+ clients. Balance, coordination, light resistance and daily movement quality focus.",
    assignedTo: [],
  },
  {
    name: "Online Home Workout (No Equipment)",
    category: "Fat Loss", level: "Intermediate",
    days: "4x / week", duration: "35 min",
    description: "Bodyweight-only program for online clients training at home. Progressive difficulty with zero equipment needed.",
    assignedTo: [],
  },
  {
    name: "Pre-Wedding Transformation",
    category: "Muscle Gain", level: "Intermediate",
    days: "5x / week", duration: "55 min",
    description: "12-week body composition program combining fat loss and toning. Designed for brides/grooms wanting to look their best on their big day.",
    assignedTo: [],
  },
];

const categoryColor: Record<string, string> = {
  "Fat Loss": "by", "Strength": "bo", "Mobility": "bb",
  "Performance": "bp", "Rehab": "bg", "HIIT": "br", "Muscle Gain": "bp"
};
const levelColor: Record<string, string> = {
  "Beginner": "bg", "Intermediate": "by", "Advanced": "br"
};

export default function Templates() {
  const { trainers } = useAdmin();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState<Template | null>(null);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [catFilter, setCatFilter] = useState("All");
  const [assignSaving, setAssignSaving] = useState(false);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "templates"), orderBy("createdAt", "desc")),
      (snap) => setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template)))
    );
    return () => unsub();
  }, []);

  const seedPremade = async () => {
    if (!confirm("This will add 20 premade templates. Continue?")) return;
    setSeeding(true);
    for (const t of PREMADE) {
      await addDoc(collection(db, "templates"), {
        ...t, status: "active", assignedTo: [], createdAt: serverTimestamp()
      });
    }
    setSeeding(false);
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (t: Template) => {
    setEditTarget(t);
    setForm({ name: t.name, category: t.category, level: t.level, days: t.days, duration: t.duration, description: t.description });
    setShowForm(true);
  };
  const openAssign = (t: Template) => {
    setShowAssign(t);
    setSelectedTrainers(t.assignedTo || []);
  };

  const save = async () => {
    if (!form.name || !form.days || !form.duration) return;
    setSaving(true);
    if (editTarget) {
      await updateDoc(doc(db, "templates", editTarget.id), { ...form });
    } else {
      await addDoc(collection(db, "templates"), {
        ...form, status: "active", assignedTo: [], createdAt: serverTimestamp()
      });
    }
    setSaving(false); setShowForm(false); setForm(EMPTY_FORM); setEditTarget(null);
  };

  const saveAssign = async () => {
    if (!showAssign) return;
    setAssignSaving(true);
    await updateDoc(doc(db, "templates", showAssign.id), { assignedTo: selectedTrainers });
    setAssignSaving(false); setShowAssign(null);
  };

  const toggleTrainer = (id: string) => {
    setSelectedTrainers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const archive = async (id: string) => updateDoc(doc(db, "templates", id), { status: "archived" });
  const restore = async (id: string) => updateDoc(doc(db, "templates", id), { status: "active" });
  const remove  = async (id: string) => {
    if (!confirm("Delete this template permanently?")) return;
    await deleteDoc(doc(db, "templates", id));
  };

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  const visible = templates
    .filter((t) => t.status === filter)
    .filter((t) => catFilter === "All" || t.category === catFilter);

  return (
    <>
      <style>{`
        .tmpl-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 640px) {
          .tmpl-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1100px) {
          .tmpl-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
        .tmpl-card {
          background: var(--bg1);
          border: 1px solid var(--b0);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: box-shadow 0.15s, transform 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .tmpl-card:hover {
          box-shadow: 0 4px 16px rgba(201,168,76,0.1);
          transform: translateY(-1px);
        }
        .tmpl-name {
          font-size: 13px; font-weight: 700; color: var(--t1); line-height: 1.3;
        }
        .tmpl-desc {
          font-size: 11px; color: var(--t3); line-height: 1.5; flex: 1;
        }
        .tmpl-meta {
          display: flex; gap: 12px; flex-wrap: wrap;
        }
        .tmpl-meta span {
          font-size: 10px; color: var(--t3); display: flex; align-items: center; gap: 3px;
        }
        .tmpl-actions {
          display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;
        }
        .assign-chip {
          display: inline-flex; align-items: center;
          font-size: 10px; font-weight: 600;
          background: rgba(201,168,76,0.1);
          color: var(--brand1);
          border: 1px solid rgba(201,168,76,0.25);
          padding: 2px 7px; border-radius: 8px;
        }
        .trainer-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; cursor: pointer;
          border: 1.5px solid var(--b0); margin-bottom: 6px;
          transition: border-color 0.15s, background 0.15s;
          background: var(--bg2);
        }
        .trainer-row.selected {
          border-color: var(--brand1);
          background: rgba(201,168,76,0.06);
        }
        .trainer-check {
          width: 18px; height: 18px; border-radius: 5px;
          border: 2px solid var(--b1); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; transition: background 0.15s, border-color 0.15s;
        }
        .trainer-row.selected .trainer-check {
          background: var(--brand1); border-color: var(--brand1); color: #fff;
        }
        .seed-banner {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
          background: rgba(201,168,76,0.07);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 10px; padding: 12px 16px;
          margin-bottom: 14px;
        }
        .seed-text { font-size: 12px; color: var(--t2); }
        .seed-text strong { color: var(--t1); }
        .filter-scroll {
          display: flex; gap: 6px; overflow-x: auto;
          padding-bottom: 4px; margin-bottom: 12px;
        }
        .filter-scroll::-webkit-scrollbar { height: 3px; }
        .filter-scroll::-webkit-scrollbar-thumb { background: var(--b1); border-radius: 2px; }
        .sh-wrap {
          display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;
        }
        @media (min-width: 640px) {
          .sh-wrap { flex-direction: row; align-items: center; }
        }
        .sh-actions {
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        @media (min-width: 640px) {
          .sh-actions { margin-left: auto; }
        }
      `}</style>

      {/* ── CREATE / EDIT MODAL ── */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">{editTarget ? "Edit Template" : "Create Template"}</div>
            <div className="field">
              <label>Template Name *</label>
              <input className="fi" placeholder="e.g. Beginner Fat Loss" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="g2">
              <div className="field">
                <label>Category</label>
                <select className="fi" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  <option>Fat Loss</option><option>Strength</option><option>Muscle Gain</option>
                  <option>Mobility</option><option>HIIT</option><option>Performance</option><option>Rehab</option>
                </select>
              </div>
              <div className="field">
                <label>Level</label>
                <select className="fi" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field">
                <label>Days per Week *</label>
                <input className="fi" placeholder="e.g. 3x/week" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} />
              </div>
              <div className="field">
                <label>Session Duration *</label>
                <input className="fi" placeholder="e.g. 45 min" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea className="fi" rows={3} placeholder="What is this template for? Who is it suited for?" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={save} disabled={saving}>{saving ? "Saving..." : editTarget ? "Save Changes" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {showAssign && (
        <div className="overlay" onClick={() => setShowAssign(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Assign Template</div>
            <div className="fs12 t3 mb12" style={{ lineHeight: 1.5 }}>
              Assigning <strong style={{ color: "var(--t1)" }}>{showAssign.name}</strong> to trainers.
              Selected trainers will see this in their portal.
            </div>
            {trainers.length === 0 && <div className="alert al-b">No trainers found.</div>}
            {trainers.map((t) => {
              const sel = selectedTrainers.includes(t.id);
              return (
                <div key={t.id} className={`trainer-row ${sel ? "selected" : ""}`} onClick={() => toggleTrainer(t.id)}>
                  <div className="trainer-check">{sel ? "✓" : ""}</div>
                  <div className="av av-t" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {(t.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="fs12 fw6 t1">{t.name}</div>
                    <div className="fs10 t3">{t.speciality || "Trainer"}</div>
                  </div>
                  <span className={`badge fs10 ${t.status === "active" ? "bg" : "br"}`}>{t.status}</span>
                </div>
              );
            })}
            <div className="row mt16 gap8">
              <button className="btn btn-g btn-s" onClick={() => setShowAssign(null)}>Cancel</button>
              <div className="fs11 t3" style={{ flex: 1, textAlign: "center", alignSelf: "center" }}>
                {selectedTrainers.length} trainer{selectedTrainers.length !== 1 ? "s" : ""} selected
              </div>
              <button className="btn btn-p btn-s" onClick={saveAssign} disabled={assignSaving}>
                {assignSaving ? "Saving..." : "Confirm Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEED BANNER (shown when no templates exist) ── */}
      {templates.length === 0 && (
        <div className="seed-banner">
          <div className="seed-text">
            <strong>No templates yet.</strong> Load 20 professionally designed premade templates instantly — Fat Loss, Strength, HIIT, Rehab and more.
          </div>
          <button className="btn btn-p btn-s" onClick={seedPremade} disabled={seeding}>
            {seeding ? "Loading..." : "⚡ Load 20 Premade Templates"}
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="sh-wrap">
        <div className="sh-l">
          <h2>Workout Templates</h2>
          <p>{templates.filter((t) => t.status === "active").length} active · visible to all assigned trainers</p>
        </div>
        <div className="sh-actions">
          <div className="tabs" style={{ marginBottom: 0 }}>
            <div className={`tab ${filter === "active" ? "on" : ""}`} onClick={() => setFilter("active")}>
              Active ({templates.filter((t) => t.status === "active").length})
            </div>
            <div className={`tab ${filter === "archived" ? "on" : ""}`} onClick={() => setFilter("archived")}>
              Archived ({templates.filter((t) => t.status === "archived").length})
            </div>
          </div>
          {templates.length > 0 && (
            <button className="btn btn-g btn-s" onClick={seedPremade} disabled={seeding} title="Add premade templates">
              {seeding ? "Loading..." : "⚡ Add Premade"}
            </button>
          )}
          <button className="btn btn-p btn-s" onClick={openCreate}>+ Create</button>
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div className="filter-scroll">
        {categories.map((c) => (
          <div key={c} className={`tab ${catFilter === c ? "on" : ""}`} onClick={() => setCatFilter(c)} style={{ flexShrink: 0 }}>
            {c}
          </div>
        ))}
      </div>

      {/* ── EMPTY STATE ── */}
      {visible.length === 0 && (
        <div className="alert al-b" style={{ textAlign: "center", padding: "20px" }}>
          {filter === "active" ? "No active templates in this category." : "No archived templates."}
        </div>
      )}

      {/* ── TEMPLATE GRID ── */}
      <div className="tmpl-grid">
        {visible.map((t) => {
          const assignedNames = (t.assignedTo || [])
            .map((id) => trainers.find((tr) => tr.id === id)?.name)
            .filter(Boolean);
          return (
            <div key={t.id} className="tmpl-card" style={{ opacity: t.status === "archived" ? 0.65 : 1 }}>
              {/* Badges */}
              <div className="row gap6" style={{ flexWrap: "wrap" }}>
                <span className={`badge fs10 ${categoryColor[t.category] || "bgr"}`}>{t.category}</span>
                <span className={`badge fs10 ${levelColor[t.level] || "bgr"}`}>{t.level}</span>
                {t.status === "archived" && <span className="badge bgr fs10">Archived</span>}
              </div>

              {/* Name */}
              <div className="tmpl-name">{t.name}</div>

              {/* Description */}
              {t.description && <div className="tmpl-desc">{t.description}</div>}

              {/* Meta */}
              <div className="tmpl-meta">
                <span>📅 {t.days}</span>
                <span>⏱ {t.duration}</span>
              </div>

              {/* Assigned trainers */}
              {assignedNames.length > 0 && (
                <div className="row gap6" style={{ flexWrap: "wrap" }}>
                  {assignedNames.map((n, i) => (
                    <span key={i} className="assign-chip">👤 {n}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="tmpl-actions">
                {t.status === "active" ? (
                  <>
                    <button className="btn btn-p btn-xs" onClick={() => openAssign(t)}>
                      Assign{assignedNames.length > 0 ? ` (${assignedNames.length})` : ""}
                    </button>
                    <button className="btn btn-g btn-xs" onClick={() => openEdit(t)}>Edit</button>
                    <button className="btn btn-dn btn-xs" onClick={() => archive(t.id)}>Archive</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-ok btn-xs" onClick={() => restore(t.id)}>Restore</button>
                    <button className="btn btn-dn btn-xs" onClick={() => remove(t.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
