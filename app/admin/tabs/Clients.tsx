"use client";
import { useState } from "react";
import { useAdmin } from "../AdminContext";
import ClientDetail from "../../components/ClientDetail";

export default function Clients() {
  const {
    filteredClients, trainers, clients,
    clientSearch, setClientSearch,
    trainerFilter, setTrainerFilter,
    clientStatusFilter, setClientStatusFilter,
    atRiskClients, expiredClients, lowClassClients,
    openRenewClient, openEditClient,
    showEditClient, setShowEditClient,
    editForm, setEditForm,
    saveEditClient,
    name,
  } = useAdmin();

  const [detailClient, setDetailClient] = useState<any>(null);

  // Full page detail
  if (detailClient) {
    return (
      <ClientDetail
        client={detailClient}
        role="admin"
        loggerName={name}
        loggerUid="admin"
        onBack={() => setDetailClient(null)}
      />
    );
  }

  return (
    <>
      {/* ── Edit Client Modal ── */}
      {showEditClient && editForm && (
        <div className="overlay" onClick={() => setShowEditClient(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-t">Edit Client — {editForm.name}</div>
            <div className="g2">
              <div className="field"><label>Full Name *</label>
                <input className="fi" value={editForm.name || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="field"><label>Email</label>
                <input className="fi" type="email" value={editForm.email || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Gender</label>
                <select className="fi" value={editForm.gender || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="field"><label>Age</label>
                <input className="fi" type="number" value={editForm.age || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, age: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Assign Trainer *</label>
                <select className="fi" value={editForm.trainerId || ""} onChange={(e) => {
                  const t = trainers.find((tr) => tr.id === e.target.value);
                  setEditForm((p: any) => ({ ...p, trainerId: e.target.value, trainerName: t?.name || "" }));
                }}>
                  <option value="">Select trainer...</option>
                  {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Program Type</label>
                <select className="fi" value={editForm.programType || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, programType: e.target.value }))}>
                  <option>1-on-1</option><option>Couple</option><option>Online</option>
                </select>
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Start Date</label>
                <input className="fi" type="date" value={editForm.startDate || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="field"><label>End Date</label>
                <input className="fi" type="date" value={editForm.endDate || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Sessions Included</label>
                <input className="fi" type="number" value={editForm.sessionsIncluded || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, sessionsIncluded: e.target.value }))} />
              </div>
              <div className="field"><label>Sessions Logged</label>
                <input className="fi" type="number" value={editForm.sessionsLogged || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, sessionsLogged: e.target.value }))} />
              </div>
            </div>
            <div className="g2">
              <div className="field"><label>Plan Name</label>
                <input className="fi" value={editForm.plan || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, plan: e.target.value }))} />
              </div>
              <div className="field"><label>Location</label>
                <input className="fi" value={editForm.location || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <div className="field"><label>Status</label>
              <select className="fi" value={editForm.status || "Active"} onChange={(e) => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                <option>Active</option><option>On Hold</option><option>Inactive</option>
              </select>
            </div>
            <div className="field"><label>Medical Notes</label>
              <textarea className="fi" rows={2} value={editForm.medicalNotes || ""} onChange={(e) => setEditForm((p: any) => ({ ...p, medicalNotes: e.target.value }))} style={{ resize: "none" }} />
            </div>
            <div className="row mt16 gap8">
              <button className="btn btn-g btn-s" onClick={() => setShowEditClient(false)}>Cancel</button>
              <button className="btn btn-p btn-s mla" onClick={saveEditClient}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="sh">
        <div className="sh-l"><h2>Client Oversight</h2><p>{filteredClients.length} clients</p></div>
      </div>

      {atRiskClients.length > 0 && (
        <div className="alert al-r mb12">
          🚨 {atRiskClients.length} at-risk client{atRiskClients.length > 1 ? "s" : ""} — expired, low sessions, or low compliance.
        </div>
      )}
      {expiredClients.length > 0 && (
        <div className="alert al-y mb8">
          📅 {expiredClients.length} plan{expiredClients.length > 1 ? "s" : ""} expired: {expiredClients.map((c) => c.name).join(", ")}
        </div>
      )}

      {/* Stats */}
      <div className="g4 mb16">
        {[
          { l: "Total",     v: clients.length,                                           c: "var(--blue)" },
          { l: "Active",    v: clients.filter((c) => c.status === "Active").length,      c: "var(--green)" },
          { l: "At Risk",   v: atRiskClients.length,                                     c: "var(--red)" },
          { l: "Low Sessions", v: lowClassClients.length,                                c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c, fontSize: 26 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <input className="fi" placeholder="Search clients or trainers..."
          value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
        <select className="fi" value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
          <option value="all">All Trainers</option>
          {trainers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
      <div className="tabs mb16">
        {[{ v: "all", l: "All" }, { v: "active", l: "Active" }, { v: "inactive", l: "Inactive" }].map((opt) => (
          <div key={opt.v} className={`tab ${clientStatusFilter === opt.v ? "on" : ""}`}
            onClick={() => setClientStatusFilter(opt.v)}>{opt.l}</div>
        ))}
      </div>

      {/* Client list */}
      <div className="col gap10">
        {filteredClients.map((c) => (
          <div key={c.id} className="card" style={{ cursor: "pointer" }} onClick={() => setDetailClient(c)}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div className="av av-c" style={{ flexShrink: 0 }}>
                {(c.name || "?").split(" ").map((n: string) => n[0] || "").join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{c.name}</span>
                  <span className={`badge fs10 ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span>
                  {(c.classesLeft || 0) <= 2 && <span className="badge br fs10">⚠ Low</span>}
                  {c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive" && <span className="badge br fs10">Expired</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 6 }}>
                  {c.trainerName} · {c.programType} · {c.location || "—"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--t3)", minWidth: 70 }}>Compliance</span>
                  <div style={{ flex: 1, height: 6, background: "var(--s3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${c.compliance || 0}%`, height: "100%", borderRadius: 3,
                      background: (c.compliance||0) >= 85 ? "var(--green)" : (c.compliance||0) >= 70 ? "var(--yellow)" : "var(--red)",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t1)", minWidth: 32 }}>{c.compliance || 0}%</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "var(--t3)" }}>Sessions: <b style={{ color: "var(--t1)" }}>{c.sessionsLogged||0}/{c.sessionsIncluded||0}</b></span>
                  <span style={{ fontSize: 12, color: (c.classesLeft||0) <= 2 ? "var(--red)" : "var(--t3)" }}>Left: <b>{c.classesLeft||0}</b></span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
              <button className="btn btn-g btn-xs" style={{ flex: 1 }}
                onClick={(e) => { e.stopPropagation(); setDetailClient(c); }}>
                👁 View
              </button>
              <button className="btn btn-g btn-xs" style={{ flex: 1 }}
                onClick={(e) => { e.stopPropagation(); openEditClient(c); }}>
                ✏️ Edit
              </button>
              {((c.classesLeft || 0) <= 2 || (c.endDate && new Date(c.endDate) < new Date())) && (
                <button className="btn btn-warn btn-xs" style={{ flex: 1 }}
                  onClick={(e) => { e.stopPropagation(); openRenewClient(c); }}>
                  🔄 Renew
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && <div className="alert al-b">No clients match your filters.</div>}
      </div>
    </>
  );
}
