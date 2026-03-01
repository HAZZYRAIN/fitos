"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import {
  doc, getDoc, updateDoc, collection, query,
  where, orderBy, getDocs, serverTimestamp,
} from "firebase/firestore";
import { S } from "../../../../styles/dashboard";
import type { Client, SessionLog, ProgressLog } from "../../../../types";

// ── Tiny reusable stat card ──
function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card-sm" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fd)", color: color || "var(--t1)" }}>{value}</div>
    </div>
  );
}

// ── Success toast ──
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      background: "var(--green)", color: "#fff",
      padding: "12px 20px", borderRadius: 10,
      fontWeight: 600, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }}>
      ✓ {message}
    </div>
  );
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const trainerId = params.trainerId as string;
  const clientId = params.clientId as string;

  // ── Data state ──
  const [client, setClient] = useState<Client | null>(null);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Edit state ──
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [editingMedical, setEditingMedical] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [planForm, setPlanForm] = useState<any>({});
  const [medicalForm, setMedicalForm] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // ── Load client ──
  useEffect(() => {
    async function load() {
      try {
        const clientRef = doc(db, "trainers", trainerId, "clients", clientId);
        const snap = await getDoc(clientRef);
        if (!snap.exists()) { setNotFound(true); setLoading(false); return; }
        const data = { id: snap.id, trainerId, ...snap.data() } as Client;
        setClient(data);
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          gender: data.gender || "",
          age: data.age || "",
          programType: data.programType || "1-on-1",
          location: data.location || "",
          status: data.status || "Active",
        });
        setPlanForm({
          plan: data.plan || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          sessionsIncluded: data.sessionsIncluded || 0,
        });
        setMedicalForm(data.medicalNotes || "");
      } catch (e) {
        setNotFound(true);
      }

      // ── Load session logs (by client name) ──
      try {
        const clientSnap = await getDoc(doc(db, "trainers", trainerId, "clients", clientId));
        const clientName = clientSnap.data()?.name || "";
        const sessSnap = await getDocs(
          query(collection(db, "sessionLogs"), where("client", "==", clientName), orderBy("createdAt", "desc"))
        );
        setSessionLogs(sessSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SessionLog)));

        // ── Load progress logs ──
        const progSnap = await getDocs(
          query(collection(db, "progressLogs"), where("clientName", "==", clientName), orderBy("createdAt", "desc"))
        );
        setProgressLogs(progSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressLog)));
      } catch (e) {
        // logs not found is non-fatal
      }

      setLoading(false);
    }
    load();
  }, [trainerId, clientId]);

  // ── Save helpers ──
  const clientRef = doc(db, "trainers", trainerId, "clients", clientId);

  const saveProfile = async () => {
    setSaving(true);
    await updateDoc(clientRef, { ...profileForm, updatedAt: serverTimestamp() });
    setClient((p) => p ? { ...p, ...profileForm } : p);
    setEditingProfile(false);
    setSaving(false);
    setToast("Profile updated");
  };

  const savePlan = async () => {
    setSaving(true);
    const updates = {
      ...planForm,
      sessionsIncluded: Number(planForm.sessionsIncluded),
      classesLeft: Math.max(0, Number(planForm.sessionsIncluded) - (client?.sessionsLogged || 0)),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(clientRef, updates);
    setClient((p) => p ? { ...p, ...updates } : p);
    setEditingPlan(false);
    setSaving(false);
    setToast("Plan updated");
  };

  const saveMedical = async () => {
    setSaving(true);
    await updateDoc(clientRef, { medicalNotes: medicalForm, updatedAt: serverTimestamp() });
    setClient((p) => p ? { ...p, medicalNotes: medicalForm } : p);
    setEditingMedical(false);
    setSaving(false);
    setToast("Medical notes updated");
  };

  const toggleStatus = async () => {
    if (!client) return;
    const next = client.status === "Active" ? "Inactive" : "Active";
    await updateDoc(clientRef, { status: next, updatedAt: serverTimestamp() });
    setClient((p) => p ? { ...p, status: next } : p);
    setToast(`Client marked ${next}`);
  };

  // ── Loading / not found ──
  if (loading) return (
    <>
      <style>{S}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508" }}>
        <div style={{ color: "var(--t3)", fontFamily: "Outfit,sans-serif" }}>Loading client...</div>
      </div>
    </>
  );

  if (notFound || !client) return (
    <>
      <style>{S}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050508", gap: 16 }}>
        <div style={{ color: "var(--t1)", fontSize: 18, fontWeight: 700, fontFamily: "Outfit,sans-serif" }}>Client not found</div>
        <button className="btn btn-g btn-s" onClick={() => router.back()}>← Go Back</button>
      </div>
    </>
  );

  const initials = (client.name || "?").split(" ").map((n) => n[0] || "").join("").toUpperCase();
  const compliance = client.compliance || 0;
  const classesLeft = client.classesLeft || 0;

  return (
    <>
      <style>{S}</style>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Outfit,sans-serif" }}>

        {/* ── TOP NAV ── */}
        <div style={{ background: "var(--s1)", borderBottom: "1px solid var(--b1)", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn btn-g btn-s" onClick={() => router.back()}>← Back</button>
          <div style={{ fontSize: 13, color: "var(--t3)" }}>Admin → Clients → {client.name}</div>
          <div style={{ marginLeft: "auto" }}>
            <button
              className={`btn btn-s ${client.status === "Active" ? "btn-dn" : "btn-ok"}`}
              onClick={toggleStatus}
            >
              {client.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

          {/* ── HEADER ── */}
          <div className="card mb24" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div className="av av-c" style={{ width: 64, height: 64, fontSize: 20, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--t1)" }}>{client.name}</div>
              <div style={{ fontSize: 13, color: "var(--t3)", marginTop: 4 }}>
                Trainer: <span style={{ color: "var(--t2)", fontWeight: 600 }}>{client.trainerName}</span>
                {client.programType && <> · {client.programType}</>}
                {client.location && <> · {client.location}</>}
              </div>
              <div className="row gap8 mt8">
                <span className={`badge fs10 ${client.status === "Active" ? "bg" : client.status === "On Hold" ? "by" : "br"}`}>{client.status}</span>
                {client.gender && <span className="badge bgr fs10">{client.gender}</span>}
                {client.age && <span className="badge bgr fs10">{client.age} yrs</span>}
                {client.email && <span className="fs11 t3">{client.email}</span>}
              </div>
            </div>
          </div>

          {/* ── PLAN STATS ── */}
          <div className="g4 mb24">
            <StatCard label="Sessions Included" value={client.sessionsIncluded || 0} />
            <StatCard label="Sessions Done" value={client.sessionsLogged || 0} color="var(--green)" />
            <StatCard
              label="Sessions Left"
              value={classesLeft}
              color={classesLeft <= 2 ? "var(--red)" : classesLeft <= 5 ? "var(--yellow)" : "var(--green)"}
            />
            <StatCard
              label="Compliance"
              value={`${compliance}%`}
              color={compliance < 70 ? "var(--red)" : compliance < 85 ? "var(--yellow)" : "var(--green)"}
            />
          </div>

          <div className="g2 mb24" style={{ gap: 20 }}>

            {/* ── LEFT COLUMN ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── PROFILE DETAILS ── */}
              <div className="card">
                <div className="ch">
                  <span className="ct">Profile Details</span>
                  {!editingProfile && <button className="btn btn-g btn-xs mla" onClick={() => setEditingProfile(true)}>Edit</button>}
                </div>
                {!editingProfile ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginTop: 8 }}>
                    {[
                      ["Name", client.name],
                      ["Email", client.email || "—"],
                      ["Gender", client.gender || "—"],
                      ["Age", client.age ? `${client.age} yrs` : "—"],
                      ["Program Type", client.programType || "—"],
                      ["Location", client.location || "—"],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600, marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="g2 mt8">
                      <div className="field"><label>Full Name</label><input className="fi" value={profileForm.name} onChange={(e) => setProfileForm((p: any) => ({ ...p, name: e.target.value }))} /></div>
                      <div className="field"><label>Email</label><input className="fi" type="email" value={profileForm.email} onChange={(e) => setProfileForm((p: any) => ({ ...p, email: e.target.value }))} /></div>
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
                      <button className="btn btn-p btn-s mla" onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
                    </div>
                  </>
                )}
              </div>

              {/* ── PLAN DETAILS ── */}
              <div className="card">
                <div className="ch">
                  <span className="ct">Plan Details</span>
                  {!editingPlan && <button className="btn btn-g btn-xs mla" onClick={() => setEditingPlan(true)}>Edit</button>}
                </div>
                {!editingPlan ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginTop: 8 }}>
                    {[
                      ["Plan Name", client.plan || "—"],
                      ["Start Date", client.startDate || "—"],
                      ["End Date", client.endDate || "—"],
                      ["Sessions Included", client.sessionsIncluded || 0],
                      ["Sessions Done", client.sessionsLogged || 0],
                      ["Sessions Left", classesLeft],
                      ["Last Session", client.lastSession || "—"],
                      ["Missed Sessions", client.missedSessions || 0],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                        <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600, marginTop: 2 }}>{val}</div>
                      </div>
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
                      <button className="btn btn-p btn-s mla" onClick={savePlan} disabled={saving}>{saving ? "Saving..." : "Save Plan"}</button>
                    </div>
                  </>
                )}
              </div>

              {/* ── MEDICAL NOTES ── */}
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
                    <textarea
                      className="fi mt8"
                      rows={4}
                      style={{ resize: "none", width: "100%" }}
                      value={medicalForm}
                      onChange={(e) => setMedicalForm(e.target.value)}
                      placeholder="Injuries, conditions, restrictions..."
                    />
                    <div className="row gap8 mt12">
                      <button className="btn btn-g btn-s" onClick={() => setEditingMedical(false)}>Cancel</button>
                      <button className="btn btn-p btn-s mla" onClick={saveMedical} disabled={saving}>{saving ? "Saving..." : "Save Notes"}</button>
                    </div>
                  </>
                )}
              </div>

              {/* ── FLAGS PLACEHOLDER ── */}
              <div className="card">
                <div className="ch"><span className="ct">Active Flags</span><span className="badge bg fs10 mla">0 open</span></div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--t3)" }}>
                  No active flags. Automatic flag detection coming in the next update.
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── SESSION HISTORY ── */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: "16px 20px" }}>
                  <div className="ch">
                    <span className="ct">Session History</span>
                    <span className="badge bb fs10 mla">{sessionLogs.length} sessions</span>
                  </div>
                </div>
                {sessionLogs.length === 0 ? (
                  <div style={{ padding: "0 20px 16px", fontSize: 12, color: "var(--t3)" }}>No sessions logged yet.</div>
                ) : (
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>Date</th><th>Type</th><th>Status</th><th>Duration</th><th>Late</th><th>Notes</th></tr>
                      </thead>
                      <tbody>
                        {sessionLogs.map((s) => (
                          <tr key={s.id}>
                            <td className="fs11 fw6">{s.date}</td>
                            <td><span className="badge bgr fs10">{s.type}</span></td>
                            <td><span className={`badge fs10 ${s.status === "completed" ? "bg" : s.status === "missed" ? "br" : "by"}`}>{s.status}</span></td>
                            <td className="fs11 t3">{s.duration > 0 ? `${s.duration}m` : "—"}</td>
                            <td>{s.late ? <span className="overdue-tag">LATE</span> : <span className="tg fs11">✓</span>}</td>
                            <td className="fs11 t3" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── PROGRESS HISTORY ── */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: "16px 20px" }}>
                  <div className="ch">
                    <span className="ct">Progress History</span>
                    <span className="badge bb fs10 mla">{progressLogs.length} entries</span>
                  </div>
                </div>
                {progressLogs.length === 0 ? (
                  <div style={{ padding: "0 20px 16px", fontSize: 12, color: "var(--t3)" }}>No progress entries logged yet.</div>
                ) : (
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>Date</th><th>Weight</th><th>Body Fat</th><th>Waist</th><th>Squat</th><th>Bench</th></tr>
                      </thead>
                      <tbody>
                        {progressLogs.map((p) => (
                          <tr key={p.id}>
                            <td className="fs11 fw6">{p.date}</td>
                            <td className="fs11">{p.weight ? `${p.weight}kg` : "—"}</td>
                            <td className="fs11">{p.bf ? `${p.bf}%` : "—"}</td>
                            <td className="fs11">{p.waist ? `${p.waist}cm` : "—"}</td>
                            <td className="fs11">{p.squat ? `${p.squat}kg` : "—"}</td>
                            <td className="fs11">{p.bench ? `${p.bench}kg` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
