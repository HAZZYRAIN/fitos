"use client";
// ============================================================
// MY CLIENTS — TRAINER
// Same logic as before, cleaner mobile-first layout
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

  const compColor = (pct: number) =>
    pct >= 85 ? "var(--green)" : pct >= 70 ? "var(--yellow)" : "var(--red)";

  const avgCompliance = Math.round(
    myClients.reduce((s, c) => s + (c.compliance || 0), 0) / (myClients.length || 1)
  );

  return (
    <>
      <style>{`
        /* ── Alerts ── */
        .mc-alert {
          display: flex; gap: 8px; align-items: flex-start;
          padding: 11px 13px; border-radius: 10px; margin-bottom: 9px;
          font-size: 12px; font-weight: 600; line-height: 1.5;
        }
        .mc-alert-r { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; }
        .mc-alert-y { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); color: #f59e0b; }

        /* ── Stats row ── */
        .mc-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 16px; }
        .mc-stat {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 11px; padding: 11px 8px; text-align: center;
          position: relative; overflow: hidden;
        }
        .mc-stat-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 2px 2px 0 0; }
        .mc-stat-v { font-size: 20px; font-weight: 800; font-family: var(--fd); }
        .mc-stat-l { font-size: 9px; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; }

        /* ── Header ── */
        .mc-sh { margin-bottom: 14px; }
        .mc-sh h2 { margin: 0 0 2px; font-size: 18px; font-weight: 800; color: var(--t1); }
        .mc-sh p  { margin: 0; font-size: 12px; color: var(--t3); }

        /* ── Cards list ── */
        .mc-list { display: flex; flex-direction: column; gap: 10px; }

        /* ── Client card ── */
        .mc-card {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 13px; overflow: hidden;
          cursor: pointer; transition: border-color 0.15s;
        }
        .mc-card:active { opacity: 0.92; }
        .mc-card-body { padding: 13px 13px 10px; }

        /* top row: avatar + info + status */
        .mc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .mc-av {
          width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--brand1), #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #fff;
        }
        .mc-info { flex: 1; min-width: 0; }
        .mc-cname { font-size: 14px; font-weight: 800; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mc-csub  { font-size: 11px; color: var(--t3); margin-top: 1px; }
        .mc-sbadge {
          flex-shrink: 0; font-size: 10px; font-weight: 800;
          padding: 3px 9px; border-radius: 20px;
        }
        .mc-sbadge-g { background: rgba(34,197,94,0.12);  color: #22c55e; }
        .mc-sbadge-y { background: rgba(245,158,11,0.12); color: #f59e0b; }
        .mc-sbadge-r { background: rgba(239,68,68,0.12);  color: #ef4444; }

        /* medical */
        .mc-med {
          display: flex; gap: 6px; align-items: flex-start;
          background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.18);
          border-radius: 7px; padding: 6px 9px; margin-bottom: 10px;
          font-size: 11px; color: #f59e0b; font-weight: 600; line-height: 1.4;
        }

        /* compliance row */
        .mc-comp { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .mc-comp-lbl { font-size: 10px; color: var(--t4); font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; width: 70px; flex-shrink: 0; }
        .mc-comp-track { flex: 1; height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
        .mc-comp-fill  { height: 100%; border-radius: 3px; transition: width 0.3s; }
        .mc-comp-pct   { font-size: 11px; font-weight: 800; width: 32px; text-align: right; flex-shrink: 0; }

        /* mini stat boxes */
        .mc-mini { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
        .mc-mini-box {
          background: var(--bg2); border: 1px solid var(--b0);
          border-radius: 8px; padding: 8px 6px; text-align: center;
        }
        .mc-mini-v { font-size: 14px; font-weight: 800; font-family: var(--fd); }
        .mc-mini-k { font-size: 9px; color: var(--t4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }

        /* action footer */
        .mc-foot {
          display: grid; grid-template-columns: 1fr 1fr; gap: 7px;
          padding: 10px 13px 12px;
          border-top: 1px solid var(--b0);
          background: var(--bg2);
        }
        .mc-btn {
          height: 38px; border-radius: 8px; border: none;
          font-size: 12px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          transition: opacity 0.1s; font-family: inherit;
        }
        .mc-btn:active { opacity: 0.75; }
        .mc-btn-p { background: var(--brand1); color: #fff; }
        .mc-btn-s { background: var(--bg3); color: var(--t1); border: 1px solid var(--b0); }

        /* empty */
        .mc-empty {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 13px; padding: 40px 20px; text-align: center;
          font-size: 13px; color: var(--t3);
        }

        @media (min-width: 640px) {
          .mc-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 380px) {
          .mc-stats { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      {/* ── Alerts ── */}
      {myExpiredClients.length > 0 && (
        <div className="mc-alert mc-alert-r">
          <span>📅</span>
          <span>
            <b>{myExpiredClients.length} plan{myExpiredClients.length > 1 ? "s" : ""} expired:</b>{" "}
            {myExpiredClients.map((c) => c.name).join(", ")} — contact admin to renew
          </span>
        </div>
      )}
      {myLowClassClients.length > 0 && (
        <div className="mc-alert mc-alert-y">
          <span>⚠️</span>
          <span>
            <b>Low classes:</b>{" "}
            {myLowClassClients.map((c) => `${c.name} (${c.classesLeft} left)`).join(", ")} — inform admin
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mc-sh">
        <h2>My Clients</h2>
        <p>{myClients.length} clients · {email}</p>
      </div>

      {/* ── Stats row ── */}
      <div className="mc-stats">
        {[
          { l: "Active",    v: myClients.length,          c: "var(--blue)"   },
          { l: "Avg Comp.", v: `${avgCompliance}%`,        c: compColor(avgCompliance) },
          { l: "Pending",   v: myTrainer?.pendingLogs || 0, c: "var(--red)"  },
          { l: "Alerts",    v: myClients.filter((c) =>
              c.status !== "Active" || (c.compliance || 0) < 75 || (c.missedSessions || 0) > 3
            ).length,                                       c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="mc-stat">
            <div className="mc-stat-line" style={{ background: s.c }} />
            <div className="mc-stat-v" style={{ color: s.c }}>{s.v}</div>
            <div className="mc-stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Client cards ── */}
      <div className="mc-list">
        {myClients.map((c) => {
          const pct = c.compliance || 0;
          const classesLeft = c.classesLeft || 0;
          const statusClass =
            c.status === "Active" ? "mc-sbadge-g" :
            c.status === "On Hold" ? "mc-sbadge-y" : "mc-sbadge-r";

          return (
            <div key={c.id} className="mc-card" onClick={() => setDetailClient(c)}>
              <div className="mc-card-body">

                {/* Avatar + name + status */}
                <div className="mc-top">
                  <div className="mc-av">
                    {(c.name || "?").split(" ").map((n: string) => n[0] || "").join("").slice(0, 2)}
                  </div>
                  <div className="mc-info">
                    <div className="mc-cname">{c.name}</div>
                    <div className="mc-csub">{c.programType} · {c.location}</div>
                  </div>
                  <span className={`mc-sbadge ${statusClass}`}>{c.status}</span>
                </div>

                {/* Medical note */}
                {c.medicalNotes && (
                  <div className="mc-med">
                    <span>🩹</span><span>{c.medicalNotes}</span>
                  </div>
                )}

                {/* Compliance bar */}
                <div className="mc-comp">
                  <span className="mc-comp-lbl">Compliance</span>
                  <div className="mc-comp-track">
                    <div className="mc-comp-fill" style={{ width: `${pct}%`, background: compColor(pct) }} />
                  </div>
                  <span className="mc-comp-pct" style={{ color: compColor(pct) }}>{pct}%</span>
                </div>

                {/* Mini stats */}
                <div className="mc-mini">
                  <div className="mc-mini-box">
                    <div className="mc-mini-v" style={{ color: "var(--t1)" }}>
                      {c.sessionsLogged || 0}
                      <span style={{ fontSize: 10, color: "var(--t4)", fontWeight: 600 }}>/{c.sessionsIncluded || 0}</span>
                    </div>
                    <div className="mc-mini-k">Sessions</div>
                  </div>
                  <div className="mc-mini-box">
                    <div className="mc-mini-v" style={{ color: classesLeft <= 3 ? "var(--red)" : "var(--t1)" }}>
                      {classesLeft}{classesLeft <= 3 ? " ⚠" : ""}
                    </div>
                    <div className="mc-mini-k">Remaining</div>
                  </div>
                  <div className="mc-mini-box">
                    <div className="mc-mini-v" style={{ color: compColor(pct) }}>{pct}%</div>
                    <div className="mc-mini-k">Compliance</div>
                  </div>
                </div>

              </div>

              {/* Action buttons — stop propagation so card click doesn't also fire */}
              <div className="mc-foot" onClick={(e) => e.stopPropagation()}>
                <button
                  className="mc-btn mc-btn-p"
                  onClick={(e) => { e.stopPropagation(); setLogClient(c.name); setTab("log"); }}
                >
                  📝 Log Session
                </button>
                <button
                  className="mc-btn mc-btn-s"
                  onClick={(e) => { e.stopPropagation(); setDetailClient(c); }}
                >
                  👁 View Details
                </button>
              </div>
            </div>
          );
        })}

        {myClients.length === 0 && (
          <div className="mc-empty">
            No clients assigned yet. Ask admin to assign clients to you.
          </div>
        )}
      </div>
    </>
  );
}
