"use client";
// ============================================================
// MY CLIENTS — TRAINER
// Clicking a client now opens the full ClientDetail page.
// ============================================================
import { useState } from "react";
import { useTrainer } from "../TrainerContext";
import ClientDetail from "../../components/ClientDetail";

export default function MyClients() {
  const {
    myClients, myExpiredClients, myLowClassClients,
    email, myTrainer, uid, name,
    setLogClient, setTab,
  } = useTrainer();

  const [detailClient, setDetailClient] = useState<any>(null);

  // If a client is selected, show full detail page
  if (detailClient) {
    return (
      <ClientDetail
        client={detailClient}
        role="trainer"
        loggerName={name}
        loggerUid={uid}
        onBack={() => setDetailClient(null)}
      />
    );
  }

  return (
    <>
      {/* ── Alerts ── */}
      {myExpiredClients.length > 0 && (
        <div className="alert al-r mb12">
          📅 {myExpiredClients.length} client plan{myExpiredClients.length > 1 ? "s" : ""} expired:{" "}
          {myExpiredClients.map((c) => c.name).join(", ")} — contact admin to renew
        </div>
      )}
      {myLowClassClients.length > 0 && (
        <div className="alert al-y mb12">
          ⚠ Low classes: {myLowClassClients.map((c) => `${c.name} (${c.classesLeft} left)`).join(", ")} — inform admin
        </div>
      )}

      <div className="sh">
        <div className="sh-l">
          <h2>My Clients</h2>
          <p>{myClients.length} clients · {email}</p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="g4">
        {[
          { l: "Active Clients", v: myClients.length,                                                                          c: "var(--blue)" },
          { l: "Avg Compliance", v: `${Math.round(myClients.reduce((s, c) => s + (c.compliance || 0), 0) / (myClients.length || 1))}%`, c: "var(--green)" },
          { l: "Pending Logs",   v: myTrainer?.pendingLogs || 0,                                                                c: "var(--red)" },
          { l: "Alerts",         v: myClients.filter((c) => c.status !== "Active" || (c.compliance || 0) < 75 || (c.missedSessions || 0) > 3).length, c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* ── Client cards ── */}
      <div className="g2">
        {myClients.map((c) => (
          <div
            key={c.id}
            className="cc"
            onClick={() => setDetailClient(c)}
            style={{ cursor: "pointer" }}
          >
            {/* Header */}
            <div className="row mb12">
              <div className="av av-c">
                {(c.name || "?").split(" ").map((n: string) => n[0] || "").join("")}
              </div>
              <div>
                <div className="fw7 fs14 t1">{c.name}</div>
                <div className="fs11 t3">{c.programType} · {c.location}</div>
              </div>
              <span className={`badge fs10 mla ${c.status === "Active" ? "bg" : c.status === "On Hold" ? "by" : "br"}`}>
                {c.status}
              </span>
            </div>

            {c.medicalNotes && (
              <div className="alert al-y mb8 fs11">🩹 {c.medicalNotes}</div>
            )}

            {/* Compliance bar */}
            <div className="row gap8 mb12">
              <span className="fs11 t3">Compliance</span>
              <div className="pw" style={{ flex: 1 }}>
                <div
                  className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`}
                  style={{ width: `${c.compliance || 0}%` }}
                />
              </div>
              <span className="fs11 fw7">{c.compliance || 0}%</span>
            </div>

            {/* Mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
              {[
                { v: `${c.sessionsLogged || 0}/${c.sessionsIncluded || 0}`, k: "Sessions",   c: "var(--t1)" },
                { v: c.classesLeft || 0,                                    k: "Remaining",  c: (c.classesLeft || 0) <= 3 ? "var(--red)" : "var(--t1)" },
                { v: `${c.compliance || 0}%`,                               k: "Compliance", c: "var(--green)" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{s.k}</div>
                </div>
              ))}
            </div>

            {/* Action buttons — stop propagation so card click doesn't fire */}
            <div className="row gap6" onClick={(e) => e.stopPropagation()}>
              <button
                className="btn btn-p btn-xs"
                style={{ flex: 1 }}
                onClick={(e) => { e.stopPropagation(); setLogClient(c.name); setTab("log"); }}
              >
                📝 Log Session
              </button>
              <button
                className="btn btn-g btn-xs"
                style={{ flex: 1 }}
                onClick={(e) => { e.stopPropagation(); setDetailClient(c); }}
              >
                👁 View Details
              </button>
            </div>
          </div>
        ))}

        {myClients.length === 0 && (
          <div className="alert al-b">No clients assigned yet. Ask admin to assign clients to you.</div>
        )}
      </div>
    </>
  );
}
