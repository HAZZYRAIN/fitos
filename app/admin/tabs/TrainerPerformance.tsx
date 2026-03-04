"use client";
import { useAdmin } from "../AdminContext";
import { ScoreRing } from "../../components/ui/Charts";

export default function TrainerPerformance() {
  const {
    clients, trainers,
    setSelectedTrainer, setSelectedClient,
    setNewWarning, setShowWarning,
    setPwTarget, setShowChangePw,
  } = useAdmin();

  return (
    <>
      <style>{`
        /* ── HEADER ── */
        .tp-header { margin-bottom: 14px; }
        .tp-header h2 { font-size: 16px; font-weight: 800; color: var(--t1); }
        .tp-header p  { font-size: 12px; color: var(--t3); margin-top: 2px; }

        /* ══════════════════════════════
           MOBILE: Card layout (default)
        ══════════════════════════════ */
        .tp-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }
        .tp-card {
          background: var(--bg1);
          border: 1px solid var(--b0);
          border-radius: 10px;
          padding: 14px;
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .tp-card:hover {
          border-color: var(--brand1);
          box-shadow: 0 4px 16px rgba(201,168,76,0.1);
        }
        .tp-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .tp-card-name {
          font-size: 14px; font-weight: 700; color: var(--t1);
        }
        .tp-card-spec {
          font-size: 11px; color: var(--t3); margin-top: 1px;
        }
        .tp-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        .tp-stat {
          background: var(--bg2);
          border: 1px solid var(--b0);
          border-radius: 8px;
          padding: 8px 10px;
          text-align: center;
        }
        .tp-stat-label {
          font-size: 9px; font-weight: 600; color: var(--t4);
          text-transform: uppercase; letter-spacing: 0.7px;
          margin-bottom: 4px;
        }
        .tp-stat-value {
          font-size: 14px; font-weight: 800;
          font-family: var(--fd); color: var(--t1);
          line-height: 1;
        }
        .tp-bar-row {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px;
        }
        .tp-bar-label {
          font-size: 10px; color: var(--t3); width: 90px; flex-shrink: 0;
        }
        .tp-bar-wrap {
          flex: 1; background: var(--b0);
          border-radius: 4px; height: 6px; overflow: hidden;
        }
        .tp-bar-fill {
          height: 100%; border-radius: 4px;
          transition: width 0.3s;
        }
        .tp-bar-val {
          font-size: 11px; font-weight: 700;
          color: var(--t2); width: 32px; text-align: right; flex-shrink: 0;
        }
        .tp-card-actions {
          display: flex; gap: 6px;
          padding-top: 10px;
          border-top: 1px solid var(--b0);
        }

        /* ══════════════════════════════
           DESKTOP: Table layout
        ══════════════════════════════ */
        .tp-table-wrap { display: none; }

        @media (min-width: 900px) {
          .tp-cards     { display: none; }
          .tp-table-wrap {
            display: block;
            background: var(--bg1);
            border: 1px solid var(--b0);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 14px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          }
          .tp-table-wrap table {
            width: 100%; border-collapse: collapse;
            font-size: 12px;
          }
          .tp-table-wrap thead tr {
            background: var(--bg2);
            border-bottom: 2px solid var(--b0);
          }
          .tp-table-wrap th {
            padding: 10px 12px; text-align: left;
            font-size: 9px; font-weight: 700;
            color: var(--t3); text-transform: uppercase;
            letter-spacing: 0.8px; white-space: nowrap;
          }
          .tp-table-wrap td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--b0);
            color: var(--t2); vertical-align: middle;
          }
          .tp-table-wrap tbody tr {
            cursor: pointer;
            transition: background 0.12s;
          }
          .tp-table-wrap tbody tr:hover td { background: var(--bg2); }
          .tp-table-wrap tbody tr:last-child td { border-bottom: none; }
        }

        /* ── DROP-OFF RISK ── */
        .risk-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 640px) {
          .risk-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 1024px) {
          .risk-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
        .risk-card {
          background: var(--bg2);
          border: 1px solid var(--b0);
          border-radius: 8px;
          padding: 12px;
        }
        .risk-client-row {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid var(--b0);
          cursor: pointer;
        }
        .risk-client-row:last-child { border-bottom: none; }
        .risk-client-row:hover .risk-client-name { color: var(--brand1); }
        .risk-client-name {
          font-size: 12px; font-weight: 600; color: var(--t2);
          flex: 1; transition: color 0.15s;
        }
        .risk-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="tp-header">
        <h2>Trainer Performance</h2>
        <p>Tap any trainer to open their full profile</p>
      </div>

      {/* ══════════════════════════════════════
          MOBILE — Card layout
      ══════════════════════════════════════ */}
      <div className="tp-cards">
        {trainers.map((t) => {
          const tClients = clients.filter((c) => c.trainerId === t.id);
          const avgComp  = tClients.length
            ? Math.round(tClients.reduce((s, c) => s + (c.compliance || 0), 0) / tClients.length)
            : 0;
          const score    = t.accountabilityScore || 0;
          const sessions = t.sessions || 0;
          const assigned = t.sessionsAssigned || 0;
          const missed   = t.missedSessions || 0;
          const pending  = t.pendingLogs || 0;
          const late     = t.lateSubmissions || 0;
          const warnings = t.warnings || 0;

          return (
            <div key={t.id} className="tp-card" onClick={() => setSelectedTrainer(t)}>

              {/* Top row: avatar + name + score ring */}
              <div className="tp-card-top">
                <div className="av av-t" style={{ width: 36, height: 36, fontSize: 11 }}>
                  {(t.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tp-card-name">{t.name}</div>
                  <div className="tp-card-spec">{t.speciality}</div>
                  {t.status === "suspended" && (
                    <span className="badge br fs10" style={{ marginTop: 3, display: "inline-block" }}>Suspended</span>
                  )}
                </div>
                <ScoreRing score={score} size={44} />
              </div>

              {/* 3-col stat chips */}
              <div className="tp-stats-grid">
                <div className="tp-stat">
                  <div className="tp-stat-label">Sessions</div>
                  <div className="tp-stat-value" style={{ color: sessions < assigned * 0.9 ? "var(--red)" : "var(--green)" }}>
                    {sessions}/{assigned}
                  </div>
                </div>
                <div className="tp-stat">
                  <div className="tp-stat-label">Missed</div>
                  <div className="tp-stat-value" style={{ color: missed > 3 ? "var(--red)" : "var(--t1)" }}>
                    {missed}
                  </div>
                </div>
                <div className="tp-stat">
                  <div className="tp-stat-label">Pending</div>
                  <div className="tp-stat-value" style={{ color: pending > 0 ? "var(--yellow)" : "var(--green)" }}>
                    {pending > 0 ? pending : "✓"}
                  </div>
                </div>
                <div className="tp-stat">
                  <div className="tp-stat-label">Late Logs</div>
                  <div className="tp-stat-value" style={{ color: late > 2 ? "var(--red)" : late > 0 ? "var(--yellow)" : "var(--green)" }}>
                    {late === 0 ? "✓" : late}
                  </div>
                </div>
                <div className="tp-stat">
                  <div className="tp-stat-label">Warnings</div>
                  <div className="tp-stat-value" style={{ color: warnings > 0 ? "var(--red)" : "var(--green)" }}>
                    {warnings === 0 ? "✓" : `${warnings} ⚠`}
                  </div>
                </div>
                <div className="tp-stat">
                  <div className="tp-stat-label">Clients</div>
                  <div className="tp-stat-value">{tClients.length}</div>
                </div>
              </div>

              {/* Compliance bar */}
              <div className="tp-bar-row">
                <div className="tp-bar-label">Avg Compliance</div>
                <div className="tp-bar-wrap">
                  <div
                    className="tp-bar-fill"
                    style={{
                      width: `${avgComp}%`,
                      background: avgComp >= 85 ? "var(--green)" : avgComp >= 70 ? "var(--yellow)" : "var(--red)",
                    }}
                  />
                </div>
                <div className="tp-bar-val">{avgComp}%</div>
              </div>

              {/* Actions */}
              <div className="tp-card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-warn btn-xs"
                  onClick={() => { setNewWarning((p: any) => ({ ...p, trainer: t.name })); setShowWarning(true); }}
                >
                  ⚠ Warn
                </button>
                <button
                  className="btn btn-g btn-xs"
                  onClick={() => { setPwTarget(t); setShowChangePw(true); }}
                >
                  🔑 Password
                </button>
                <button
                  className="btn btn-p btn-xs mla"
                  onClick={() => setSelectedTrainer(t)}
                >
                  View Profile →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════
          DESKTOP — Table layout
      ══════════════════════════════════════ */}
      <div className="tp-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Trainer</th>
              <th>Score</th>
              <th>Sessions</th>
              <th>Missed</th>
              <th>Pending</th>
              <th>Avg Compliance</th>
              <th>Late Logs</th>
              <th>Warnings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((t) => {
              const tClients = clients.filter((c) => c.trainerId === t.id);
              const avgComp  = tClients.length
                ? Math.round(tClients.reduce((s, c) => s + (c.compliance || 0), 0) / tClients.length)
                : 0;
              return (
                <tr key={t.id} onClick={() => setSelectedTrainer(t)}>
                  <td>
                    <div className="row gap8">
                      <div className="av av-t" style={{ width: 28, height: 28, fontSize: 10 }}>
                        {(t.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="t1 fw6 fs13">{t.name}</div>
                        <div className="fs10 t3">{t.speciality}</div>
                      </div>
                      {t.status === "suspended" && <span className="badge br fs10">suspended</span>}
                    </div>
                  </td>
                  <td><ScoreRing score={t.accountabilityScore || 0} size={44} /></td>
                  <td>
                    <span className={`fw7 ${(t.sessions || 0) < (t.sessionsAssigned || 0) * 0.9 ? "tr" : "tg"}`}>
                      {t.sessions || 0}/{t.sessionsAssigned || 0}
                    </span>
                  </td>
                  <td>
                    <span className={(t.missedSessions || 0) > 3 ? "tr fw7" : "t2"}>
                      {t.missedSessions || 0}
                    </span>
                  </td>
                  <td>
                    <span className={(t.pendingLogs || 0) > 0 ? "ty fw7" : "tg"}>
                      {(t.pendingLogs || 0) === 0 ? "✓ Clear" : `${t.pendingLogs} pending`}
                    </span>
                  </td>
                  <td>
                    <div className="row gap8">
                      <div className="pw" style={{ width: 52 }}>
                        <div
                          className={`pb ${avgComp >= 85 ? "pb-g" : avgComp >= 70 ? "pb-y" : "pb-r"}`}
                          style={{ width: `${avgComp}%` }}
                        />
                      </div>
                      <span className="fs11 fw7">{avgComp}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={(t.lateSubmissions || 0) > 2 ? "tr fw7" : (t.lateSubmissions || 0) > 0 ? "ty" : "tg"}>
                      {(t.lateSubmissions || 0) === 0 ? "✓ None" : t.lateSubmissions}
                    </span>
                  </td>
                  <td>
                    <span className={(t.warnings || 0) > 0 ? "tr fw7" : "tg"}>
                      {(t.warnings || 0) === 0 ? "✓ Clean" : `${t.warnings} ⚠`}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row gap4">
                      <button
                        className="btn btn-warn btn-xs"
                        onClick={() => { setNewWarning((p: any) => ({ ...p, trainer: t.name })); setShowWarning(true); }}
                      >
                        Warn
                      </button>
                      <button
                        className="btn btn-g btn-xs"
                        onClick={() => { setPwTarget(t); setShowChangePw(true); }}
                      >
                        🔑
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── CLIENT DROP-OFF RISK ── */}
      <div className="card">
        <div className="ch">
          <span className="ct">Client Drop-off Risk by Trainer</span>
          <span className="badge br">
            {trainers.reduce((sum, t) => {
              const mine = clients.filter((c) => c.trainerId === t.id);
              return sum + mine.filter((c) => (c.missedSessions || 0) > 3 || (c.compliance || 0) < 70).length;
            }, 0)} at risk
          </span>
        </div>
        <div className="risk-grid">
          {trainers.map((t) => {
            const mine   = clients.filter((c) => c.trainerId === t.id);
            const atRisk = mine.filter((c) => (c.missedSessions || 0) > 3 || (c.compliance || 0) < 70);
            return (
              <div key={t.id} className="risk-card">
                {/* Trainer row */}
                <div className="row gap8 mb8" style={{ cursor: "pointer" }} onClick={() => setSelectedTrainer(t)}>
                  <div className="av av-t" style={{ width: 26, height: 26, fontSize: 10 }}>
                    {(t.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="fw7 fs13 t1">{t.name}</span>
                  <span className={`badge fs10 mla ${atRisk.length > 0 ? "br" : "bg"}`}>
                    {atRisk.length > 0 ? `${atRisk.length} at risk` : "All good"}
                  </span>
                </div>

                {/* At-risk clients */}
                {atRisk.length === 0 && (
                  <div className="fs11 tg">✓ No drop-off risks</div>
                )}
                {atRisk.map((c) => (
                  <div key={c.id} className="risk-client-row" onClick={() => setSelectedClient(c)}>
                    <div
                      className="risk-dot"
                      style={{ background: (c.compliance || 0) < 70 ? "var(--red)" : "var(--yellow)" }}
                    />
                    <span className="risk-client-name">{c.name}</span>
                    <span className="fs10 t3">{c.compliance || 0}%</span>
                    <span className="fs10 t3" style={{ marginLeft: 6 }}>{c.missedSessions || 0} missed</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
