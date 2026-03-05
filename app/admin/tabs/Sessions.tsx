"use client";
import { useAdmin } from "../AdminContext";

export default function Sessions() {
  const { clients, trainers, sessionLogs, pendingLogs, setSelectedClient, setSelectedTrainer } = useAdmin();

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    completed:  { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", label: "Completed"  },
    missed:     { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", label: "Missed"     },
    cancelled:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", label: "Cancelled"  },
    scheduled:  { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6", label: "Scheduled"  },
  };

  const totalSessions   = sessionLogs.length;
  const completedCount  = sessionLogs.filter((s) => s.status === "completed").length;
  const missedCount     = sessionLogs.filter((s) => s.status === "missed").length;
  const lateCount       = sessionLogs.filter((s) => s.late).length;

  return (
    <>
      <style>{`
        /* ── Header ── */
        .sl-sh { margin-bottom: 16px; }
        .sl-sh h2 { margin: 0 0 2px; font-size: 18px; font-weight: 800; color: var(--t1); }
        .sl-sh p  { margin: 0; font-size: 12px; color: var(--t3); }

        /* ── Alert ── */
        .sl-alert {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px; border-radius: 10px; margin-bottom: 14px;
          font-size: 12px; font-weight: 700; line-height: 1.4;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); color: #ef4444;
        }

        /* ── Stats strip ── */
        .sl-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 16px; }
        .sl-stat {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 11px; padding: 11px 8px; text-align: center;
          position: relative; overflow: hidden;
        }
        .sl-stat-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .sl-stat-v { font-size: 20px; font-weight: 800; font-family: var(--fd); }
        .sl-stat-l { font-size: 9px; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }

        /* ── Cards list (mobile) ── */
        .sl-cards { display: flex; flex-direction: column; gap: 8px; }

        .sl-card {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 12px; padding: 12px 13px; overflow: hidden;
        }
        .sl-card-late { border-left: 3px solid #ef4444; }

        /* Row 1: client + trainer + status */
        .sl-row1 { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .sl-names { flex: 1; min-width: 0; }
        .sl-client {
          font-size: 14px; font-weight: 800; color: var(--t1);
          cursor: pointer; display: inline-block;
          border-bottom: 1px dashed var(--b1);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
        }
        .sl-client:active { opacity: 0.7; }
        .sl-trainer {
          font-size: 11px; color: var(--t3); margin-top: 2px;
          cursor: pointer; display: inline-block;
          border-bottom: 1px dashed transparent;
        }
        .sl-trainer:active { color: var(--brand1); }

        .sl-status-badge {
          flex-shrink: 0; font-size: 10px; font-weight: 800;
          padding: 3px 9px; border-radius: 20px; margin-top: 1px;
        }

        /* Row 2: meta chips */
        .sl-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .sl-chip {
          font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
          background: var(--bg3); color: var(--t3);
        }
        .sl-chip-type { background: var(--bg3); color: var(--t2); }
        .sl-chip-late {
          background: rgba(239,68,68,0.1); color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2); font-weight: 800;
        }
        .sl-chip-ok {
          background: rgba(34,197,94,0.1); color: #22c55e;
        }

        /* Notes */
        .sl-notes {
          margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--b0);
          font-size: 11px; color: var(--t3); line-height: 1.4;
        }

        /* ── Desktop table ── */
        .sl-table-wrap {
          display: none;
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 13px; overflow: hidden;
        }
        .sl-table-wrap table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sl-table-wrap thead tr { background: var(--bg2); }
        .sl-table-wrap th {
          padding: 10px 14px; text-align: left;
          font-size: 10px; font-weight: 700; color: var(--t4);
          text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
        }
        .sl-table-wrap tbody tr { border-top: 1px solid var(--b0); transition: background 0.1s; }
        .sl-table-wrap tbody tr:hover { background: var(--bg2); }
        .sl-table-wrap td { padding: 11px 14px; vertical-align: middle; }
        .sl-td-client {
          font-size: 13px; font-weight: 800; color: var(--t1);
          cursor: pointer; white-space: nowrap;
        }
        .sl-td-client:hover { color: var(--brand1); text-decoration: underline; }
        .sl-td-trainer { font-size: 12px; color: var(--t2); cursor: pointer; white-space: nowrap; }
        .sl-td-trainer:hover { color: var(--brand1); }
        .sl-late-row { border-left: 3px solid #ef4444; }

        /* ── Empty ── */
        .sl-empty {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 13px; padding: 40px 20px; text-align: center;
          font-size: 13px; color: var(--t3);
        }

        @media (min-width: 768px) {
          .sl-cards { display: none; }
          .sl-table-wrap { display: block; }
          .sl-stats { grid-template-columns: repeat(4,1fr); }
        }
        @media (max-width: 380px) {
          .sl-stats { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="sl-sh">
        <h2>Session Logs</h2>
        <p>All trainer submissions — late logs flagged</p>
      </div>

      {/* ── Pending alert ── */}
      {pendingLogs > 0 && (
        <div className="sl-alert">
          <span>🚨</span>
          <span><b>{pendingLogs} session log{pendingLogs > 1 ? "s" : ""}</b> not submitted yet</span>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div className="sl-stats">
        {[
          { l: "Total",     v: totalSessions,  c: "var(--blue)"   },
          { l: "Completed", v: completedCount, c: "#22c55e"        },
          { l: "Missed",    v: missedCount,    c: "#ef4444"        },
          { l: "Late",      v: lateCount,      c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="sl-stat">
            <div className="sl-stat-bar" style={{ background: s.c }} />
            <div className="sl-stat-v" style={{ color: s.c }}>{s.v}</div>
            <div className="sl-stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {sessionLogs.length === 0 ? (
        <div className="sl-empty">No session logs yet.</div>
      ) : (
        <>
          {/* ── MOBILE: Cards ── */}
          <div className="sl-cards">
            {sessionLogs.map((s) => {
              const sc = statusConfig[s.status] || statusConfig["scheduled"];
              return (
                <div key={s.id} className={`sl-card ${s.late ? "sl-card-late" : ""}`}>

                  {/* Row 1: names + status */}
                  <div className="sl-row1">
                    <div className="sl-names">
                      <div
                        className="sl-client"
                        onClick={() => { const c = clients.find((cl) => cl.name === s.client); if (c) setSelectedClient(c); }}
                      >
                        {s.client}
                      </div>
                      <div
                        className="sl-trainer"
                        onClick={() => { const t = trainers.find((tr) => tr.name === s.trainer); if (t) setSelectedTrainer(t); }}
                      >
                        👤 {s.trainer}
                      </div>
                    </div>
                    <span
                      className="sl-status-badge"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* Row 2: meta chips */}
                  <div className="sl-meta">
                    <span className="sl-chip sl-chip-type">{s.type}</span>
                    <span className="sl-chip">📅 {s.date}</span>
                    {s.duration > 0 && <span className="sl-chip">⏱ {s.duration}m</span>}
                    {s.loggedAt && <span className="sl-chip">🕐 {s.loggedAt}</span>}
                    {s.late
                      ? <span className="sl-chip sl-chip-late">⚠ LATE</span>
                      : <span className="sl-chip sl-chip-ok">✓ On time</span>
                    }
                  </div>

                  {/* Notes */}
                  {s.notes && <div className="sl-notes">📝 {s.notes}</div>}
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP: Table ── */}
          <div className="sl-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Logged At</th>
                  <th>Late?</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessionLogs.map((s) => {
                  const sc = statusConfig[s.status] || statusConfig["scheduled"];
                  return (
                    <tr key={s.id} className={s.late ? "sl-late-row" : ""}>
                      <td
                        className="sl-td-client"
                        onClick={() => { const c = clients.find((cl) => cl.name === s.client); if (c) setSelectedClient(c); }}
                      >
                        {s.client}
                      </td>
                      <td
                        className="sl-td-trainer"
                        onClick={() => { const t = trainers.find((tr) => tr.name === s.trainer); if (t) setSelectedTrainer(t); }}
                      >
                        {s.trainer}
                      </td>
                      <td style={{ fontSize: 11, color: "var(--t3)", whiteSpace: "nowrap" }}>{s.date}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "var(--bg3)", color: "var(--t2)" }}>
                          {s.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--t2)" }}>{s.duration > 0 ? `${s.duration} min` : "—"}</td>
                      <td style={{ fontSize: 11, color: "var(--t3)", whiteSpace: "nowrap" }}>{s.loggedAt}</td>
                      <td>
                        {s.late
                          ? <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>⚠ LATE</span>
                          : <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓</span>
                        }
                      </td>
                      <td style={{ fontSize: 11, color: "var(--t3)", maxWidth: 180 }}>{s.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
