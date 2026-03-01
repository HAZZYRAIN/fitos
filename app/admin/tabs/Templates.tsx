"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";

interface Template {
  id: string;
  name: string;
  category: string;
  level: string;
  days: string;
  duration: string;
  description: string;
  status: "active" | "archived";
  createdAt?: any;
}

const EMPTY_FORM = { name: "", category: "Fat Loss", level: "Beginner", days: "", duration: "", description: "" };

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"active" | "archived">("active");

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "templates"), orderBy("createdAt", "desc")), (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template)));
    });
    return () => unsub();
  }, []);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (t: Template) => { setEditTarget(t); setForm({ name: t.name, category: t.category, level: t.level, days: t.days, duration: t.duration, description: t.description }); setShowForm(true); };

  const save = async () => {
    if (!form.name || !form.days || !form.duration) return;
    setSaving(true);
    if (editTarget) {
      await updateDoc(doc(db, "templates", editTarget.id), { ...form });
    } else {
      await addDoc(collection(db, "templates"), { ...form, status: "active", createdAt: serverTimestamp() });
    }
    setSaving(false); setShowForm(false); setForm(EMPTY_FORM); setEditTarget(null);
  };

  const archive = async (id: string) => {
    await updateDoc(doc(db, "templates", id), { status: "archived" });
  };

  const restore = async (id: string) => {
    await updateDoc(doc(db, "templates", id), { status: "active" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template permanently?")) return;
    await deleteDoc(doc(db, "templates", id));
  };

  const visible = templates.filter((t) => t.status === filter);

  const categoryColor: Record<string, string> = { "Fat Loss": "by", "Strength": "bo", "Mobility": "bb", "Performance": "bp", "Rehab": "bg", "HIIT": "br", "Muscle Gain": "bp" };

  return (
    <>
      {/* Modal */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">{editTarget ? "Edit Template" : "Create Template"}</div>
            <div className="field"><label>Template Name *</label><input className="fi" placeholder="e.g. Beginner Fat Loss" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="g2">
              <div className="field"><label>Category</label>
                <select className="fi" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  <option>Fat Loss</option><option>Strength</option><option>Muscle Gain</option><option>Mobility</option><option>HIIT</option><option>Performance</option><option>Rehab</option>
                </select>
              </div>
              <div className="field"><label>Level</label>
                <select className="fi" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Days per Week *</label><input className="fi" placeholder="e.g. 3x/week" value={form.days} onChange={(e) => setForm((p) => ({ ...p, days: e.target.value }))} /></div>
              <div className="field"><label>Session Duration *</label><input className="fi" placeholder="e.g. 45 min" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} /></div>
            </div>
            <div className="field"><label>Description</label><textarea className="fi" rows={3} placeholder="What is this template for? Who is it suited for?" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ resize: "none" }} /></div>
            <div className="row mt16">
              <button className="btn btn-g btn-s" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={save} disabled={saving}>{saving ? "Saving..." : editTarget ? "Save Changes" : "Create Template"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="sh">
        <div className="sh-l"><h2>Workout Templates</h2><p>Admin-created — visible to all trainers</p></div>
        <div className="row gap8">
          <div className="tabs" style={{ marginBottom: 0 }}>
            <div className={`tab ${filter === "active" ? "on" : ""}`} onClick={() => setFilter("active")}>Active ({templates.filter((t) => t.status === "active").length})</div>
            <div className={`tab ${filter === "archived" ? "on" : ""}`} onClick={() => setFilter("archived")}>Archived ({templates.filter((t) => t.status === "archived").length})</div>
          </div>
          <button className="btn btn-p btn-s" onClick={openCreate}>+ Create Template</button>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="alert al-b">{filter === "active" ? "No active templates yet. Create your first one." : "No archived templates."}</div>
      )}

      <div className="col gap12">
        {visible.map((t) => (
          <div key={t.id} className="card" style={{ opacity: t.status === "archived" ? 0.65 : 1 }}>
            <div className="row">
              <div style={{ flex: 1 }}>
                <div className="row gap10 mb8">
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{t.name}</span>
                  <span className={`badge fs10 ${categoryColor[t.category] || "bgr"}`}>{t.category}</span>
                  <span className={`badge fs10 ${t.level === "Beginner" ? "bg" : t.level === "Intermediate" ? "by" : "br"}`}>{t.level}</span>
                  {t.status === "archived" && <span className="badge bgr fs10">Archived</span>}
                </div>
                {t.description && <div className="fs12 t2 mb8">{t.description}</div>}
                <div className="row gap16">
                  <span className="fs11 t3">📅 {t.days}</span>
                  <span className="fs11 t3">⏱ {t.duration}</span>
                </div>
              </div>
              <div className="row gap8">
                {t.status === "active" ? (
                  <>
                    <button className="btn btn-g btn-s" onClick={() => openEdit(t)}>Edit</button>
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
          </div>
        ))}
      </div>
    </>
  );
}
