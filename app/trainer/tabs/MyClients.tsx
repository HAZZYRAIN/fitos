"use client";
// ============================================================
// MY CLIENTS — TRAINER (Mobile-First Redesign)
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "On Hold" | "Inactive">("All");

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

  const avgCompliance = Math.round(
    myClients.reduce((s, c) => s + (c.compliance || 0), 0) / (myClients.length || 1)
  );

  const filtered = myClients.filter((c) => {
    const matchSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.programType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getInitials = (n: string) =>
    (n || "?").split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();

  const complianceColor = (pct: number) =>
    pct >= 85 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";

  const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
    "Active":   { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", dot: "#22c55e" },
    "On Hold":  { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b" },
    "Inactive": { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", dot: "#ef4444" },
  };

  return (
    <>
      <style>{`
        .mc-wrap { padding: 0; }

        /* ── Alert banners ── */
        .mc-alert {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; border-radius: 10px; margin-bottom: 10px;
          font-size: 13px; font-weight: 600; line-height: 1.4;
        }
        .mc-alert-r { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; }
        .mc-alert-y { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); color: #f59e0b; }

        /* ── Stats strip ── */
        .mc-stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 8px; margin-bottom: 18px;
        }
        .mc-stat {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 12px; padding: 12px 10px; text-align: center;
          position: relative; overflow: hidden;
        }
        .mc-stat-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 2.5px;
          border-radius: 2px 2px 0 0;
        }
        .mc-stat-val { font-size: 22px; font-weight: 800; font-family: var(--fd); margin-bottom: 2px; }
        .mc-stat-lbl { font-size: 9px; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Search + filter row ── */
        .mc-search-row {
          display: flex; gap: 8px; margin-bottom: 14px; align-items: center;
        }
        .mc-search {
          flex: 1; height: 42px; border-radius: 10px;
          border: 1.5px solid var(--b0); background: var(--bg1);
          padding: 0 12px 0 38px; font-size: 14px;
          color: var(--t1); outline: none; font-family: inherit;
          transition: border-color 0.15s;
        }
        .mc-search:focus { border-color: var(--brand1); }
        .mc-search-wrap { position: relative; flex: 1; }
        .mc-search-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          font-size: 15px; pointer-events: none; opacity: 0.5;
        }
        .mc-filter-pill {
          display: flex; gap: 5px; flex-shrink: 0;
        }
        .mc-pill {
          height: 34px; padding: 0 11px; border-radius: 8px; border: 1.5px solid var(--b0);
          background: var(--bg1); color: var(--t3); font-size: 11px; font-weight: 700;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
          font-family: inherit;
        }
        .mc-pill.active {
          background: var(--brand1); border-color: var(--brand1); color: #fff;
        }

        /* ── Client cards ── */
        .mc-cards { display: flex; flex-direction: column; gap: 10px; }

        .mc-card {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 14px; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          cursor: pointer;
        }
        .mc-card:active { transform: scale(0.99); }

        .mc-card-top {
          padding: 14px 14px 12px;
        }

        /* Avatar + name row */
        .mc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 11px; }
        .mc-av {
          width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #fff;
          background: linear-gradient(135deg, var(--brand1), var(--brand2, #8b5cf6));
        }
        .mc-av-ring {
          width: 50px; height: 50px; border-radius: 15px; padding: 2px;
          background: conic-gradient(var(--brand1) calc(var(--pct) * 1%), var(--bg3) 0%);
          flex-shrink: 0;
        }
        .mc-av-inner {
          width: 100%; height: 100%; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #fff;
          background: var(--bg2);
        }
        .mc-name { font-size: 15px; font-weight: 800; color: var(--t1); margin-bottom: 2px; }
        .mc-sub { font-size: 11px; color: var(--t3); }
        .mc-status-badge {
          margin-left: auto; flex-shrink: 0;
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800;
        }
        .mc-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* Medical note */
        .mc-medical {
          display: flex; align-items: flex-start; gap: 6px;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
          border-radius: 8px; padding: 7px 10px; margin-bottom: 10px;
          font-size: 11px; color: #f59e0b; font-weight: 600; line-height: 1.4;
        }

        /* Compliance bar */
        .mc-compliance-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .mc-compliance-lbl { font-size: 10px; color: var(--t4); font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; flex-shrink: 0; }
        .mc-compliance-track { flex: 1; height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
        .mc-compliance-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .mc-compliance-pct { font-size: 11px; font-weight: 800; flex-shrink: 0; }

        /* Mini stats grid */
        .mc-mini { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-bottom: 12px; }
        .mc-mini-box {
          background: var(--bg2); border-radius: 9px; padding: 9px 6px;
          text-align: center; border: 1px solid var(--b0);
        }
        .mc-mini-val { font-size: 15px; font-weight: 800; font-family: var(--fd); }
        .mc-mini-key { font-size: 9px; color: var(--t4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }

        /* Action buttons */
        .mc-actions {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 7px; padding: 10px 14px 13px;
          border-top: 1px solid var(--b0); background: var(--bg2);
        }
        .mc-btn {
          height: 40px; border-radius: 9px; border: none;
          font-size: 12px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          transition: opacity 0.15s, transform 0.1s;
          font-family: inherit;
        }
        .mc-btn:active { opacity: 0.8; transform: scale(0.97); }
        .mc-btn-log { background: var(--brand1); color: #fff; }
        .mc-btn-view { background: var(--bg3); color: var(--t1); border: 1px solid var(--b0); }
        .mc-btn-wa { background: #1a3d2b; color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .mc-btn-note { background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.2); }

        /* Full-width action */
        .mc-btn-full { grid-column: 1 / -1; }

        /* Empty state */
        .mc-empty {
          text-align: center; padding: 48px 24px;
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 14px;
        }
        .mc-empty-icon { font-size: 48px; margin-bottom: 14px; }
        .mc-empty-title { font-size: 16px; font-weight: 800; color: var(--t1); margin-bottom: 6px; }
        .mc-empty-sub { font-size: 13px; color: var(--t3); }

        /* Section label */
        .mc-section-lbl {
          font-size: 10px; font-weight: 700; color: var(--t4);
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 10px; margin-top: 4px;
        }

        @media (min-width: 640px) {
          .mc-stats { grid-template-columns: repeat(4,1fr); }
          .mc-stat-val { font-size: 26px; }
          .mc-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 360px) {
          .mc-stats { grid-template-columns: repeat(2,1fr); }
          .mc-filter-pill { display: none; }
        }
      `}</style>

      <div className="mc-wrap">

        {/* ── Alert banners ── */}
        {myExpiredClients.length > 0 && (
          <div className="mc-alert mc-alert-r">
            <span>📅</span>
            <span>
              <strong>{myExpiredClients.length} plan{myExpiredClients.length > 1 ? "s" : ""} expired:</strong>{" "}
              {myExpiredClients.map((c) => c.name).join(", ")} — contact admin to renew
            </span>
          </div>
        )}
        {myLowClassClients.length > 0 && (
          <div className="mc-alert mc-alert-y">
            <span>⚠️</span>
            <span>
              <strong>Low classes:</strong>{" "}
              {myLowClassClients.map((c) => `${c.name} (${c.classesLeft} left)`).join(", ")}
            </span>
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="mc-stats">
          {[
            { l: "Clients",    v: myClients.length,                   c: "#3b82f6" },
            { l: "Avg Comp.",  v: `${avgCompliance}%`,                c: complianceColor(avgCompliance) },
            { l: "Pending",    v: myTrainer?.pendingLogs || 0,        c: "#ef4444" },
            { l: "Alerts",     v: myClients.filter((c) =>
                c.status !== "Active" ||
                (c.compliance || 0) < 75 ||
                (c.missedSessions || 0) > 3
              ).length,                                                c: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} className="mc-stat">
              <div className="mc-stat-bar" style={{ background: s.c }} />
              <div className="mc-stat-val" style={{ color: s.c }}>{s.v}</div>
              <div className="mc-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div className="mc-search-row">
          <div className="mc-search-wrap">
            <span className="mc-search-icon">🔍</span>
            <input
              className="mc-search"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mc-filter-pill">
            {(["All", "Active", "On Hold"] as const).map((s) => (
              <button
                key={s}
                className={`mc-pill ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* ── Section label ── */}
        <div className="mc-section-lbl">
          {filtered.length} of {myClients.length} clients
        </div>

        {/* ── Client cards ── */}
        <div className="mc-cards">
          {filtered.map((c) => {
            const pct = c.compliance || 0;
            const sc = statusConfig[c.status] || statusConfig["Inactive"];
            const classesLeftNum = c.classesLeft || 0;
            const phone = c.phone || c.whatsapp || "";

            return (
              <div
                key={c.id}
                className="mc-card"
                onClick={() => setDetailClient(c)}
              >
                <div className="mc-card-top">

                  {/* ── Avatar + name + status ── */}
                  <div className="mc-head">
                    <div
                      className="mc-av-ring"
                      style={{ ["--pct" as any]: pct }}
                    >
                      <div className="mc-av-inner">{getInitials(c.name)}</div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mc-name">{c.name}</div>
                      <div className="mc-sub">{c.programType} · {c.location}</div>
                    </div>

                    <div
                      className="mc-status-badge"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      <div className="mc-dot" style={{ background: sc.dot }} />
                      {c.status}
                    </div>
                  </div>

                  {/* ── Medical note ── */}
                  {c.medicalNotes && (
                    <div className="mc-medical">
                      <span>🩹</span>
                      <span>{c.medicalNotes}</span>
                    </div>
                  )}

                  {/* ── Compliance bar ── */}
                  <div className="mc-compliance-row">
                    <span className="mc-compliance-lbl">Compliance</span>
                    <div className="mc-compliance-track">
                      <div
                        className="mc-compliance-fill"
                        style={{
                          width: `${pct}%`,
                          background: complianceColor(pct),
                        }}
                      />
                    </div>
                    <span className="mc-compliance-pct" style={{ color: complianceColor(pct) }}>
                      {pct}%
                    </span>
                  </div>

                  {/* ── Mini stats ── */}
                  <div className="mc-mini">
                    <div className="mc-mini-box">
                      <div className="mc-mini-val" style={{ color: "var(--t1)" }}>
                        {c.sessionsLogged || 0}
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--t4)" }}>
                          /{c.sessionsIncluded || 0}
                        </span>
                      </div>
                      <div className="mc-mini-key">Sessions</div>
                    </div>
                    <div className="mc-mini-box">
                      <div
                        className="mc-mini-val"
                        style={{ color: classesLeftNum <= 3 ? "#ef4444" : "var(--t1)" }}
                      >
                        {classesLeftNum}
                        {classesLeftNum <= 3 && <span style={{ fontSize: 10 }}> ⚠️</span>}
                      </div>
                      <div className="mc-mini-key">Classes Left</div>
                    </div>
                    <div className="mc-mini-box">
                      <div className="mc-mini-val" style={{ color: complianceColor(pct) }}>{pct}%</div>
                      <div className="mc-mini-key">Compliance</div>
                    </div>
                  </div>

                </div>

                {/* ── Action buttons ── */}
                <div className="mc-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="mc-btn mc-btn-log"
                    onClick={(e) => { e.stopPropagation(); setLogClient(c.name); setTab("log"); }}
                  >
                    📝 Log Session
                  </button>
                  <button
                    className="mc-btn mc-btn-view"
                    onClick={(e) => { e.stopPropagation(); setDetailClient(c); }}
                  >
                    👁 View Details
                  </button>
                  {phone && (
                    <a
                      href={`https://wa.me/91${phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mc-btn mc-btn-wa"
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: "none" }}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  <button
                    className={`mc-btn mc-btn-note ${!phone ? "mc-btn-full" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setDetailClient(c); }}
                  >
                    📈 Progress
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Empty state ── */}
          {filtered.length === 0 && (
            <div className="mc-empty">
              <div className="mc-empty-icon">
                {searchQuery ? "🔍" : "👥"}
              </div>
              <div className="mc-empty-title">
                {searchQuery ? "No clients found" : "No clients assigned yet"}
              </div>
              <div className="mc-empty-sub">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Ask admin to assign clients to you"}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
