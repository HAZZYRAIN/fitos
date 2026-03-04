"use client";
// ============================================================
// ADMIN — CLIENTS TAB
// Clicking a client opens the full ClientDetail page.
// ============================================================
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
    openEditClient, openRenewClient,
    name,
  } = useAdmin();

  const [detailClient, setDetailClient] = useState<any>(null);

  // ── Full page detail view ──
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
      <div className="sh">
        <div className="sh-l">
          <h2>Client Oversight</h2>
          <p>{filteredClients.length} clients</p>
        </div>
      </div>

      {/* ── Alert banners ── */}
      {atRiskClients.length > 0 && (
        <div className="alert al-r mb12">
          🚨 {atRiskClients.length} at-risk client{atRiskClients.length > 1 ? "s" : ""} — expired, low sessions, or low compliance.
        </div>
      )}
      {expiredClients.length > 0 && (
        <div className="alert al-y mb8">
          📅 {expiredClients.length} plan{expiredClients.length > 1 ? "s" : ""} expired:{" "}
          {expiredClients.map((c) => c.name).join(", ")}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="g4 mb16">
        {[
          { l: "Total Clients",  v: clients.length,                                                     c: "var(--blue)" },
          { l: "Active",         v: clients.filter((c) => c.status === "Active").length,                c: "var(--green)" },
          { l: "At Risk",        v: atRiskClients.length,                                               c: "var(--red)" },
          { l: "Low Sessions",   v: lowClassClients.length,                                             c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c, fontSize: 26 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <input
          className="fi"
          placeholder="Search clients or trainers..."
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
        />
        <select className="fi" value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
          <option value="all">All Trainers</option>
          {trainers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div className="tabs">
          {[
            { v: "all",      l: "All" },
            { v: "active",   l: "Active" },
            { v: "inactive", l: "Inactive" },
          ].map((opt) => (
            <div
              key={opt.v}
              className={`tab ${clientStatusFilter === opt.v ? "on" : ""}`}
              onClick={() => setClientStatusFilter(opt.v)}
            >
              {opt.l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Client list ── */}
      <div className="col gap10">
        {filteredClients.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => setDetailClient(c)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Avatar */}
              <div className="av av-c" style={{ flexShrink: 0 }}>
                {(c.name || "?").split(" ").map((n: string) => n[0] || "").join("")}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{c.name}</span>
                  <span className={`badge fs10 ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>
                    {c.status}
                  </span>
                  {(c.classesLeft || 0) <= 2 && <span className="badge br fs10">⚠ Low</span>}
                  {c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive" && (
                    <span className="badge br fs10">Expired</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 6 }}>
                  {c.trainerName} · {c.programType} · {c.location || "—"}
                </div>

                {/* Compliance bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--t3)", minWidth: 70 }}>Compliance</span>
                  <div style={{ flex: 1, height: 6, background: "var(--s3)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${c.compliance || 0}%`,
                        height: "100%",
                        background: (c.compliance || 0) >= 85 ? "var(--green)" : (c.compliance || 0) >= 70 ? "var(--yellow)" : "var(--red)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t1)", minWidth: 32 }}>{c.compliance || 0}%</span>
                </div>

                {/* Mini stats */}
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "var(--t3)" }}>
                    Sessions: <b style={{ color: "var(--t1)" }}>{c.sessionsLogged || 0}/{c.sessionsIncluded || 0}</b>
                  </span>
                  <span style={{ fontSize: 12, color: (c.classesLeft || 0) <= 2 ? "var(--red)" : "var(--t3)" }}>
                    Left: <b>{c.classesLeft || 0}</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div
              style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn btn-g btn-xs"
                style={{ flex: 1 }}
                onClick={(e) => { e.stopPropagation(); setDetailClient(c); }}
              >
                👁 View
              </button>
              <button
                className="btn btn-g btn-xs"
                style={{ flex: 1 }}
                onClick={(e) => { e.stopPropagation(); openEditClient(c); }}
              >
                ✏️ Edit
              </button>
              {((c.classesLeft || 0) <= 2 || (c.endDate && new Date(c.endDate) < new Date())) && (
                <button
                  className="btn btn-warn btn-xs"
                  style={{ flex: 1 }}
                  onClick={(e) => { e.stopPropagation(); openRenewClient(c); }}
                >
                  🔄 Renew
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="alert al-b">No clients match your filters.</div>
        )}
      </div>
    </>
  );
}
