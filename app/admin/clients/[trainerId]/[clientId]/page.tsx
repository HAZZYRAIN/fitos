"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import {
  doc, getDoc, updateDoc, collection,
  query, where, getDocs, orderBy,
} from "firebase/firestore";
import { S } from "../../../../styles/dashboard";
import type { Client, SessionLog, ProgressLog, DietLog } from "../../../../types";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999, background: "var(--green)", color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      ✓ {message}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card-sm" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", color: color || "var(--t1)" }}>{value}</div>
    </div>
  );
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.trainerId as string;
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"sessions" | "progress" | "diet" | "photos">("sessions");

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [editingMedical, setEditingMedical] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [planForm, setPlanForm] = useState<any>({});
  const [medicalForm, setMedicalForm] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const clientRef = doc(db, "trainers", trainerId, "clients", clientId);
        const snap = await getDoc(clientRef);
        if (!snap.exists()) { setNotFound(true); setLoading(false); return; }
        const data = { id: snap.id, trainerId, ...snap.data() } as Client;
        setClient(data);
        setProfileForm({ name: data.name || "", email: data.email || "", gender: data.gender || "", age: data.age || "", programType: data.programType || "1-on-1", location: data.location || "", status: data.status || "Active" });
        setPlanForm({ plan: data.plan || "", startDate: data.startDate || "", endDate: data.endDate || "", sessionsIncluded: data.sessionsIncluded || 0 });
        setMedicalForm(data.medicalNotes || "");

        const clientName = data.name || "";

        // Session logs — query without orderBy to avoid index requirement, sort in JS
        try {
          const sessSnap = await getDocs(query(collection(db, "sessionLogs"), where("client", "==", clientName)));
          const logs = sessSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SessionLog));
          logs.sort((a, b) => {
            const aTime = (a.createdAt?.seconds || 0);
            const bTime = (b.createdAt?.seconds || 0);
            return bTime - aTime;
          });
          setSessionLogs(logs);
        } catch (e) { /* non-fatal */ }

        // Progress logs
        try {
          const progSnap = await getDocs(query(collection(db, "progressLogs"), where("clientName", "==", clientName)));
          const logs = progSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressLog));
          logs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setProgressLogs(logs);
        } catch (e) { /* non-fatal */ }

        // Diet logs
        try {
          const dietSnap = await getDocs(query(collection(db, "dietLogs"), where("clientName", "==", clientName)));
          const logs = dietSnap.docs.map((d) => ({ id: d.id, ...d.data() } as DietLog));
          logs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setDietLogs(logs);
        } catch (e) { /* non-fatal */ }

      } catch (e) { setNotFound(true); }
      setLoading(false);
    }
    load();
  }, [trainerId, clientId]);

  const clientRef = doc(db, "trainers", trainerId, "clients", clientId);

  const saveProfile = async () => {
    setSaving(true);
    await updateDoc(clientRef, { ...profileForm });
    setClient((p) => p ? { ...p, ...profileForm } : p);
    setEditingProfile(false); setSaving(false); setToast("Profile updated");
  };

  const savePlan = async () => {
    setSaving(true);
    const updates = { ...planForm, sessionsIncluded: Number(planForm.sessionsIncluded), classesLeft: Math.max(0, Number(planForm.sessionsIncluded) - (client?.sessionsLogged || 0)) };
    await updateDoc(clientRef, updates);
    setClient((p) => p ? { ...p, ...updates } : p);
    setEditingPlan(false); setSaving(false); setToast("Plan updated");
  };

  const saveMedical = async () => {
    setSaving(true);
    await updateDoc(clientRef, { medicalNotes: medicalForm });
    setClient((p) => p ? { ...p, medicalNotes: medicalForm } : p);
    setEditingMedical(false); setSaving(false); setToast("Medical notes updated");
  };

  const toggleStatus = async () => {
    if (!client) return;
    const next = client.status === "Active" ? "Inactive" : "Active";
    await updateDoc(clientRef, { status: next });
    setClient((p) => p ? { ...p, status: next } : p);
    setToast(`Client marked ${next}`);
  };

  if (loading) return (
    <><style>{S}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508", color: "var(--t3)", fontFamily: "Outfit,sans-serif" }}>Loading client...</div>
    </>
  );

  if (notFound || !client) return (
    <><style>{S}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050508", gap: 16, fontFamily: "Outfit,sans-serif" }}>
        <div style={{ color: "var(--t1)", fontSize: 18, fontWeight: 700 }}>Client not found</div>
        <button className="btn btn-g btn-s" onClick={() => router.back()}>← Go Back</button>
      </div>
    </>
  );

  const initials = (client.name || "?").split(" ").map((n) => n[0] || "").join("").toUpperCase();
  const compliance = client.compliance || 0;
  const classesLeft = client.classesLeft || 0;

  return (
    <><style>{S}</style>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Outfit,sans-serif" }}>

        {/* ── TOP NAV ── */}
        <div style={{ background: "var(--s1)", borderBottom: "1px solid var(--b1)", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn btn-g btn-s" onClick={() => router.back()}>← Back</button>
          <div style={{ fontSize: 13, color: "var(--t3)" }}>Admin → Clients → <span style={{ color: "var(--t2)" }}>{client.name}</span></div>
          <div style={{ marginLeft: "auto" }}>
            <button className={`btn btn-s ${client.status === "Active" ? "btn-dn" : "btn-ok"}`} onClick={toggleStatus}>
              {client.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 24px" }}>

          {/* ── HEADER ── */}
          <div className="card mb20" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div className="av av-c" style={{ width: 64, height: 64, fontSize: 20, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)" }}>{client.name}</div>
              <div style={{ fontSize: 13, color: "var(--t3)", marginTop: 4 }}>
                Trainer: <span style={{ color: "var(--t2)", fontWeight: 600 }}>{client.trainerName}</span>
                {client.programType && <> · {client.programType}</>}
                {client.location && <> · 📍{client.location}</>}
              </div>
              <div className="row gap8 mt8">
                <span className={`badge fs10 ${client.status === "Active" ? "bg" : client.status === "On Hold" ? "by" : "br"}`}>{client.status}</span>
                {client.gender && <span className="badge bgr fs10">{client.gender}</span>}
                {client.age && <span className="badge bgr fs10">{client.age} yrs</span>}
                {client.email && <span className="fs11 t3">{client.email}</span>}
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="g4 mb20">
            <StatCard label="Sessions Included" value={client.sessionsIncluded || 0} />
            <StatCard label="Sessions Done" value={client.sessionsLogged || 0} color="var(--green)" />
            <StatCard label="Sessions Left" value={classesLeft} color={classesLeft <= 2 ? "var(--red)" : classesLeft <= 5 ? "var(--yellow)" : "var(--green)"} />
            <StatCard label="Compliance" value={`${compliance}%`} color={compliance < 70 ? "var(--red)" : compliance < 85 ? "var(--yellow)" : "var(--green)"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>

            {/* ── LEFT PANEL ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Profile */}
              <div className="card">
                <div className="ch">
                  <span className="ct">Profile</span>
                  {!editingProfile && <button className="btn btn-g btn-xs mla" onClick={() => setEditingProfile(true)}>Edit</button>}
                </div>
                {!editingProfile ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: 8 }}>
                    {[["Name", client.name], ["Email", client.email || "—"], ["Gender", client.gender || "—"], ["Age", client.age ? `${client.age} yrs` : "—"], ["Program", client.programType || "—"], ["Location", client.location || "—"]].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div><div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600, marginTop: 2 }}>{v}</div></div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="g2 mt8">
                      <div className="field"><label>Name</label><input className="fi" value={profileForm.name} onChange={(e) => setProfileForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
                      <div className="field"><label>Email</label><input className="fi" value={profileForm.email} onChange={(e) => setProfileForm((p: any) => ({ ...p, email: e.target.value }))} /></div>
                    </div>
                    <div className="g2">
                      <div className="field"><label>Gender</label>
                        <select className="fi" value={profileForm.gender} onChange={(e) => setProfileForm((p: any) => ({ ...p, gender: e.target.value }))}>
                          <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div className="field"><label>Age</label><input className="fi" type="number" value={profileForm.age} onChange={(e) => setProfileForm((p: any) => ({ ...p, age: e.target.value }))} /></div>
                    </div>
                    <div className="g2">
                      <div className="field"><label>Program Type</label>
                        <select className="fi" value={profileForm.programType} onChange={(e) => setProfileForm((p: any) => ({ ...p, programType: e.target.value }))}>
                          <option>1-on-1</option><option>Couple</option><option>Online</option>
                        </select>
                      </div>
                      <div className="field"><label>Location</label><input className="fi" value={profileForm.location} onChange={(e) => setProfileForm((p: any) => ({ ...p, location: e.target.value }))} /></div>
                    </div>
                    <div className="field"><label>Status</label>
                      <select className="fi" value={profileForm.status} onChange={(e) => setProfileForm((p: any) => ({ ...p, status: e.target.value }))}>
                        <option>Active</option><option>On Hold</option><option>Inactive</option>
                      </select>
                    </div>
                    <div className="row gap8 mt12">
                      <button className="btn btn-g btn-s" onClick={() => setEditingProfile(false)}>Cancel</button>
                      <button className="btn btn-p btn-s mla" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    </div>
                  </>
                )}
              </div>

              {/* Plan */}
              <div className="card">
                <div className="ch">
                  <span className="ct">Plan Details</span>
                  {!editingPlan && <button className="btn btn-g btn-xs mla" onClick={() => setEditingPlan(true)}>Edit</button>}
                </div>
                {!editingPlan ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginTop: 8 }}>
                    {[["Plan Name", client.plan || "—"], ["Start Date", client.startDate || "—"], ["End Date", client.endDate || "—"], ["Sessions Included", client.sessionsIncluded || 0], ["Sessions Done", client.sessionsLogged || 0], ["Sessions Left", classesLeft], ["Last Session", client.lastSession || "—"], ["Missed", client.missedSessions || 0]].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div><div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600, marginTop: 2 }}>{v}</div></div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="field mt8"><label>Plan Name</label><input className="fi" value={planForm.plan} onChange={(e) => setPlanForm((p: any) => ({ ...p, plan: e.target.value }))} /></div>
                    <div className="g2">
                      <div className="field"><label>Start Date</label><input className="fi" type="date" value={planForm.startDate} onChange={(e) => setPlanForm((p: any) => ({ ...p, startDate: e.target.value }))} /></div>
                      <div className="field"><label>End Date</label><input className="fi" type="date" value={planForm.endDate} onChange={(e) => setPlanForm((p: any) => ({ ...p, endDate: e.target.value }))} /></div>
                    </div>
                    <div className="field"><label>Sessions Included</label><input className="fi" type="number" value={planForm.sessionsIncluded} onChange={(e) => setPlanForm((p: any) => ({ ...p, sessionsIncluded: e.target.value }))} /></div>
                    <div className="row gap8 mt12">
                      <button className="btn btn-g btn-s" onClick={() => setEditingPlan(false)}>Cancel</button>
                      <button className="btn btn-p btn-s mla" onClick={savePlan} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    </div>
                  </>
                )}
              </div>

              {/* Medical */}
              <div className="card">
                <div className="ch">
                  <span className="ct">Medical Notes</span>
                  {!editingMedical && <button className="btn btn-g btn-xs mla" onClick={() => setEditingMedical(true)}>Edit</button>}
                </div>
                {!editingMedical ? (
                  <div style={{ marginTop: 8, fontSize: 13, color: client.medicalNotes ? "var(--t2)" : "var(--t3)" }}>
                    {client.medicalNotes || "No medical notes recorded."}
                  </div>
                ) : (
                  <>
                    <textarea className="fi mt8" rows={4} style={{ resize: "none", width: "100%" }} value={medicalForm} onChange={(e) => setMedicalForm(e.target.value)} placeholder="Injuries, conditions, restrictions..." />
                    <div className="row gap8 mt12">
                      <button className="btn btn-g btn-s" onClick={() => setEditingMedical(false)}>Cancel</button>
                      <button className="btn btn-p btn-s mla" onClick={saveMedical} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Tab switcher */}
              <div className="tabs">
                {([["sessions", `Sessions (${sessionLogs.length})`], ["progress", `Measurements (${progressLogs.length})`], ["diet", `Nutrition (${dietLogs.length})`], ["photos", "Before/After"]] as const).map(([id, label]) => (
                  <div key={id} className={`tab ${activeTab === id ? "on" : ""}`} onClick={() => setActiveTab(id)}>{label}</div>
                ))}
              </div>

              {/* SESSION HISTORY */}
              {activeTab === "sessions" && (
                <div className="card" style={{ padding: 0 }}>
                  {sessionLogs.length === 0 ? (
                    <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>No sessions logged yet for this client.</div>
                  ) : (
                    <div className="tw">
                      <table>
                        <thead><tr><th>Date</th><th>Type</th><th>Status</th><th>Duration</th><th>Late</th><th>Injury Flag</th><th>Notes</th></tr></thead>
                        <tbody>
                          {sessionLogs.map((s) => (
                            <tr key={s.id}>
                              <td className="fs11 fw6">{s.date}</td>
                              <td><span className="badge bgr fs10">{s.type}</span></td>
                              <td><span className={`badge fs10 ${s.status === "completed" ? "bg" : s.status === "missed" ? "br" : "by"}`}>{s.status}</span></td>
                              <td className="fs11 t3">{s.duration > 0 ? `${s.duration}m` : "—"}</td>
                              <td>{s.late ? <span className="overdue-tag">LATE</span> : <span className="tg fs11">✓</span>}</td>
                              <td>{s.injuryFlag ? <span className="badge br fs10">{s.injuryFlag}</span> : <span className="fs11 t3">—</span>}</td>
                              <td className="fs11 t3" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* MEASUREMENT HISTORY */}
              {activeTab === "progress" && (
                <div className="card" style={{ padding: 0 }}>
                  {progressLogs.length === 0 ? (
                    <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>No measurements logged yet for this client.</div>
                  ) : (
                    <div className="tw">
                      <table>
                        <thead><tr><th>Date</th><th>Weight</th><th>Body Fat</th><th>Chest</th><th>Waist</th><th>Hips</th><th>Arms</th><th>Squat</th><th>Bench</th><th>Deadlift</th></tr></thead>
                        <tbody>
                          {progressLogs.map((p) => (
                            <tr key={p.id}>
                              <td className="fs11 fw6">{p.date}</td>
                              <td className="fs11">{p.weight ? `${p.weight}kg` : "—"}</td>
                              <td className="fs11">{p.bf ? `${p.bf}%` : "—"}</td>
                              <td className="fs11">{p.chest ? `${p.chest}cm` : "—"}</td>
                              <td className="fs11">{p.waist ? `${p.waist}cm` : "—"}</td>
                              <td className="fs11">{p.hips ? `${p.hips}cm` : "—"}</td>
                              <td className="fs11">{p.arms ? `${p.arms}cm` : "—"}</td>
                              <td className="fs11">{p.squat ? `${p.squat}kg` : "—"}</td>
                              <td className="fs11">{p.bench ? `${p.bench}kg` : "—"}</td>
                              <td className="fs11">{p.deadlift ? `${p.deadlift}kg` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* DIET / NUTRITION HISTORY */}
              {activeTab === "diet" && (
                <div className="card" style={{ padding: 0 }}>
                  {dietLogs.length === 0 ? (
                    <div style={{ padding: 20, fontSize: 13, color: "var(--t3)" }}>No nutrition logs yet for this client.</div>
                  ) : (
                    <div className="tw">
                      <table>
                        <thead><tr><th>Date</th><th>Protein</th><th>Water</th><th>Steps</th><th>Sleep</th><th>Quality</th><th>Notes</th></tr></thead>
                        <tbody>
                          {dietLogs.map((d) => (
                            <tr key={d.id}>
                              <td className="fs11 fw6">{d.date}</td>
                              <td className="fs11 fw7" style={{ color: d.protein >= 100 ? "var(--green)" : "var(--red)" }}>{d.protein ? `${d.protein}g` : "—"}</td>
                              <td className="fs11">{d.water ? `${d.water}L` : "—"}</td>
                              <td className="fs11">{d.steps ? d.steps.toLocaleString() : "—"}</td>
                              <td className="fs11">{d.sleep ? `${d.sleep}h` : "—"}</td>
                              <td><span className={`badge fs10 ${d.sleepQuality === "Great" ? "bg" : d.sleepQuality === "Good" ? "bb" : d.sleepQuality === "Average" ? "by" : "br"}`}>{d.sleepQuality || "—"}</span></td>
                              <td className="fs11 t3" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* BEFORE / AFTER PHOTOS */}
              {activeTab === "photos" && (
                <div className="card">
                  <div className="ch"><span className="ct">Before / After Photos</span><span className="badge by fs10 mla">Coming Soon</span></div>
                  <div style={{ marginTop: 16, padding: "32px 0", textAlign: "center", border: "2px dashed var(--b1)", borderRadius: 10 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <div style={{ fontSize: 14, color: "var(--t2)", fontWeight: 600 }}>Photo uploads coming in the next update</div>
                    <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 6 }}>Before, during, and after transformation photos will appear here</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
