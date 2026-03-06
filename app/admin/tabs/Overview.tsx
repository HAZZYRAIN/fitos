"use client";
import { useAdmin } from "../AdminContext";
import { Donut } from "../../components/ui/Charts";

export default function Overview() {
  const {
    clients, trainers, sessionLogs,
    pendingLogs, avgAccountability,
    atRiskClients, expiredClients, lowClassClients,
    todaySessions, setTab, setSelectedClient,
  } = useAdmin();

  const activeClients = clients.filter((c) => c.status !== "Inactive").length;
  const avgCompliance = clients.length
    ? Math.round(clients.reduce((s, c) => s + (c.compliance || 0), 0) / clients.length)
    : 0;
  const avgRetention = trainers.length
    ? Math.round(trainers.reduce((s, t) => s + (t.retention || 0), 0) / trainers.length)
    : 0;

  const urgentCount = atRiskClients.length + pendingLogs + expiredClients.length + lowClassClients.length;

  const stats = [
    {
      label: "Active Clients",
      value: activeClients,
      sub: `${clients.filter((c) => c.status === "Active").length} paid active`,
      trend: "+4 this month",
      up: true,
      color: "#2563a8",
      onClick: () => setTab("clients"),
    },
    {
      label: "Pending Logs",
      value: pendingLogs,
      sub: pendingLogs > 0 ? "Must be logged today" : "All clear ✓",
      trend: pendingLogs > 0 ? "Action needed" : "Up to date",
      up: pendingLogs === 0,
      color: pendingLogs > 0 ? "#c0392b" : "#1e8a4c",
      onClick: () => setTab("sessions"),
    },
    {
      label: "Avg Accountability",
      value: `${avgAccountability}%`,
      sub: "Across all trainers",
      trend: "+2% vs last month",
      up: true,
      color: "#c9a84c",
      onClick: () => setTab("trainer-perf"),
    },
    {
      label: "Urgent Alerts",
      value: urgentCount,
      sub: "Flags, expired, low classes",
      trend: urgentCount > 0 ? "Review now" : "All clear ✓",
      up: urgentCount === 0,
      color: urgentCount > 0 ? "#c0392b" : "#1e8a4c",
      onClick: () => setTab("flags"),
    },
  ];

  return (
    <>
      <style>{`
        /* ── Prevent ALL horizontal overflow ── */
        .ov-root {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          overscroll-behavior: none;
        }

        .ov-header { margin-bottom: 14px; }
        .ov-header h2 { font-size: 16px; font-weight: 800; color: var(--t1); }
        .ov-header p  { font-size: 12px; color: var(--t3); margin-top: 2px; }

        /* Stat cards — 2x2 on mobile, 4-col on desktop */
        .stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        @media (min-width: 768px) {
          .stat-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .sc {
          background: var(--bg1);
          border: 1px solid var(--b0);
          border-radius: 10px;
          padding: 12px 14px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.18s, transform 0.15s, border-color 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          /* Prevent any child from overflowing */
          max-width: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .sc:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .sc:active { transform: scale(0.97); }
        .sc-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 10px 10px 0 0;
        }
        .sc-label {
          font-size: 10px; font-weight: 600;
          color: var(--t3); text-transform: uppercase;
          letter-spacing: 0.7px; margin-bottom: 6px; margin-top: 2px;
          /* Prevent label from overflowing */
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sc-value {
          font-size: 26px; font-weight: 800;
          font-family: var(--fd); line-height: 1;
          margin-bottom: 4px;
        }
        .sc-sub {
          font-size: 10px; color: var(--t3); margin-bottom: 6px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sc-trend {
          font-size: 10px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 3px;
          padding: 2px 7px; border-radius: 8px;
          white-space: nowrap;
        }
        .sc-trend.up { background: rgba(30,138,76,0.08); color: var(--green); }
        .sc-trend.dn { background: rgba(192,57,43,0.08); color: var(--red); }
        .sc-arrow {
          position: absolute;
          bottom: 10px; right: 12px;
          font-size: 14px; color: var(--b1);
          transition: color 0.15s;
        }
        .sc:hover .sc-arrow { color: var(--brand1); }

        /* ── MIDDLE SECTION ── */
        .mid-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        @media (min-width: 768px) {
          .mid-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── SESSION ROW ── */
        .srow {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid var(--b0);
          min-width: 0;
        }
        .srow:last-child { border-bottom: none; }
        .srow-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; margin-top: 4px;
        }
        .srow-name {
          font-size: 12px; font-weight: 700; color: var(--t1);
          cursor: pointer;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .srow-name:hover { color: var(--brand1); }
        .srow-meta {
          font-size: 10px; color: var(--t3); margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .late-pill {
          display: inline-block;
          font-size: 9px; font-weight: 700;
          background: rgba(184,134,11,0.1);
          color: var(--yellow);
          border: 1px solid rgba(184,134,11,0.2);
          padding: 1px 5px; border-radius: 4px;
          margin-left: 4px; letter-spacing: 0.5px;
        }

        /* ── PLATFORM HEALTH ── */
        .health-grid {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0;
          gap: 8px;
          flex-wrap: wrap;
          overflow: hidden;
        }
        .health-item {
          display: flex; flex-direction: column;
          align-items: center; gap: 6px;
          flex: 1; min-width: 80px;
          overflow: hidden;
        }
        .health-label {
          font-size: 10px; font-weight: 600;
          color: var(--t3); text-transform: uppercase;
          letter-spacing: 0.6px; text-align: center;
        }

        /* ── ALERT ITEMS ── */
        .alert-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 9px 10px; border-radius: 8px;
          margin-bottom: 6px; cursor: pointer;
          transition: opacity 0.15s;
          border: 1px solid transparent;
          min-width: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .alert-item:last-child { margin-bottom: 0; }
        .alert-item:hover { opacity: 0.85; }
        .alert-item.red    { background: rgba(192,57,43,0.05); border-color: rgba(192,57,43,0.15); }
        .alert-item.yellow { background: rgba(184,134,11,0.05); border-color: rgba(184,134,11,0.15); }
        .alert-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
        .alert-text {
          font-size: 11px; color: var(--t2); line-height: 1.4; font-weight: 500;
          min-width: 0; overflow: hidden;
          word-break: break-word;
        }
        .alert-name { font-weight: 700; color: var(--t1); }
        .empty-state {
          font-size: 12px; color: var(--t3);
          text-align: center; padding: 16px 0;
        }
      `}</style>

      <div className="ov-root">

        {/* ── PAGE HEADER ── */}
        <div className="ov-header">
          <h2>Control Room</h2>
          <p>Live platform overview — tap any card to navigate</p>
        </div>

        {/* ── STAT CARDS 2x2 → 4-col ── */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="sc" onClick={s.onClick}>
              <div className="sc-bar" style={{ background: s.color }} />
              <div className="sc-label">{s.label}</div>
              <div className="sc-value" style={{ color: s.color }}>{s.value}</div>
              <div className="sc-sub">{s.sub}</div>
              <div className={`sc-trend ${s.up ? "up" : "dn"}`}>
                {s.up ? "▲" : "▼"} {s.trend}
              </div>
              <div className="sc-arrow">→</div>
            </div>
          ))}
        </div>

        {/* ── MIDDLE: Today's Sessions + Urgent Alerts ── */}
        <div className="mid-grid">

          {/* Today's Sessions */}
          <div className="card">
            <div className="ch">
              <span className="ct">Today's Sessions</span>
              <span className="badge bb">{todaySessions.length} total</span>
            </div>
            {todaySessions.length === 0 ? (
              <div className="empty-state">No sessions logged today yet</div>
            ) : (
              todaySessions.map((s) => (
                <div key={s.id} className="srow">
                  <div
                    className="srow-dot"
                    style={{
                      background:
                        s.status === "completed" ? "var(--green)"
                        : s.status === "missed"  ? "var(--red)"
                        : "var(--yellow)",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div className="row gap8" style={{ flexWrap: "wrap", minWidth: 0 }}>
                      <span
                        className="srow-name"
                        onClick={() => {
                          const c = clients.find((cl) => cl.name === s.client);
                          if (c) setSelectedClient(c);
                        }}
                      >
                        {s.client}
                      </span>
                      <span className="badge mla fs10"
                        style={{
                          background:
                            s.status === "completed" ? "rgba(30,138,76,0.1)"
                            : s.status === "missed"  ? "rgba(192,57,43,0.1)"
                            : "rgba(184,134,11,0.1)",
                          color:
                            s.status === "completed" ? "var(--green)"
                            : s.status === "missed"  ? "var(--red)"
                            : "var(--yellow)",
                          border: "none",
                          flexShrink: 0,
                        }}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="srow-meta">
                      {s.type} · {s.trainer} · {s.date}
                      {s.late && <span className="late-pill">LATE LOG</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Urgent Alerts */}
          <div className="card">
            <div className="ch">
              <span className="ct">Urgent Alerts</span>
              <span
                className="badge"
                style={{
                  background: urgentCount > 0 ? "rgba(192,57,43,0.1)" : "rgba(30,138,76,0.1)",
                  color: urgentCount > 0 ? "var(--red)" : "var(--green)",
                }}
              >
                {urgentCount > 0 ? `${urgentCount} items` : "All clear"}
              </span>
            </div>

            {urgentCount === 0 && (
              <div className="empty-state">🎉 No urgent alerts right now</div>
            )}

            {pendingLogs > 0 && (
              <div className="alert-item red" onClick={() => setTab("sessions")}>
                <span className="alert-icon">📝</span>
                <div className="alert-text">
                  <span className="alert-name">{pendingLogs} session log{pendingLogs > 1 ? "s" : ""} pending</span>
                  <br />Must be submitted today
                </div>
              </div>
            )}

            {expiredClients.map((c) => (
              <div key={c.id} className="alert-item red" onClick={() => setSelectedClient(c)}>
                <span className="alert-icon">📅</span>
                <div className="alert-text">
                  <span className="alert-name">{c.name}</span> — plan expired
                  <br />{c.endDate}
                </div>
              </div>
            ))}

            {lowClassClients.map((c) => (
              <div key={c.id} className="alert-item yellow" onClick={() => setSelectedClient(c)}>
                <span className="alert-icon">⚠️</span>
                <div className="alert-text">
                  <span className="alert-name">{c.name}</span> — {c.classesLeft} class{c.classesLeft === 1 ? "" : "es"} left
                </div>
              </div>
            ))}

            {clients
              .filter((c) => (c.compliance || 0) < 70)
              .map((c) => (
                <div key={c.id} className="alert-item yellow" onClick={() => setSelectedClient(c)}>
                  <span className="alert-icon">📉</span>
                  <div className="alert-text">
                    <span className="alert-name">{c.name}</span> — {c.compliance || 0}% attendance
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── PLATFORM HEALTH ── */}
        <div className="card">
          <div className="ch">
            <span className="ct">Platform Health</span>
            <span className="badge bgr">Live</span>
          </div>
          <div className="health-grid">
            {[
              { label: "Client Retention", value: avgRetention,      color: "var(--green)",  onClick: () => setTab("trainer-perf") },
              { label: "Accountability",   value: avgAccountability, color: "var(--brand1)", onClick: () => setTab("trainer-perf") },
              { label: "Avg Compliance",   value: avgCompliance,     color: "var(--blue)",   onClick: () => setTab("clients")      },
            ].map((h, i) => (
              <div key={i} className="health-item" style={{ cursor: "pointer" }} onClick={h.onClick}>
                <Donut value={h.value} color={h.color} label={h.label} />
                <div className="health-label">{h.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
