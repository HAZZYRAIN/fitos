"use client";
import { useAdmin } from "../AdminContext";
import { ScoreRing } from "../../components/ui/Charts";

export default function TrainersList() {
  const {
    clients, trainers,
    setSelectedTrainer, setShowAddTrainer,
    setNewClient, setShowAddClient,
    setPwTarget, setShowChangePw,
    toggleTrainerStatus,
  } = useAdmin();

  return (
    <>
      <style>{`
        /* ── Header ── */
        .tl-sh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
        .tl-sh h2 { margin: 0 0 2px; font-size: 18px; font-weight: 800; color: var(--t1); }
        .tl-sh p  { margin: 0; font-size: 12px; color: var(--t3); }
        .tl-add {
          height: 40px; padding: 0 16px; border-radius: 9px; border: none;
          background: var(--brand1); color: #fff;
          font-size: 13px; font-weight: 800; cursor: pointer;
          white-space: nowrap; flex-shrink: 0; font-family: inherit;
          transition: opacity 0.15s;
        }
        .tl-add:active { opacity: 0.8; }

        /* ── Grid ── */
        .tl-grid { display: flex; flex-direction: column; gap: 10px; }

        /* ── Card ── */
        .tl-card {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 13px; overflow: hidden; cursor: pointer;
          transition: border-color 0.15s;
        }
        .tl-card:active { opacity: 0.93; }
        .tl-card-suspended { opacity: 0.55; }

        .tl-body { padding: 13px 13px 12px; }

        /* top row */
        .tl-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .tl-av {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: var(--bg3); border: 1px solid var(--b0);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .tl-info { flex: 1; min-width: 0; }
        .tl-name { font-size: 14px; font-weight: 800; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tl-spec { font-size: 11px; color: var(--t3); margin-top: 2px; }

        /* badges row */
        .tl-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
        .tl-badge {
          font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px;
        }
        .tl-badge-g { background: rgba(34,197,94,0.12);  color: #22c55e; }
        .tl-badge-r { background: rgba(239,68,68,0.12);  color: #ef4444; }
        .tl-badge-o { background: rgba(249,115,22,0.12); color: #f97316; }
        .tl-badge-d { background: var(--bg3); color: var(--t3); }
        .tl-badge-w { background: rgba(239,68,68,0.1); color: #ef4444; }

        /* mini stats */
        .tl-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
        .tl-stat {
          background: var(--bg2); border: 1px solid var(--b0);
          border-radius: 8px; padding: 8px 6px; text-align: center;
        }
        .tl-stat-v { font-size: 14px; font-weight: 800; font-family: var(--fd); }
        .tl-stat-k { font-size: 9px; color: var(--t4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }

        /* action footer */
        .tl-foot {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;
          padding: 9px 13px 12px;
          border-top: 1px solid var(--b0);
          background: var(--bg2);
        }
        .tl-btn {
          height: 36px; border-radius: 8px; border: none;
          font-size: 11px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 4px;
          transition: opacity 0.1s; font-family: inherit;
        }
        .tl-btn:active { opacity: 0.75; }
        .tl-btn-s { background: var(--bg3); color: var(--t1); border: 1px solid var(--b0); }
        .tl-btn-suspend { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .tl-btn-activate { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }

        /* empty */
        .tl-empty {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 13px; padding: 40px 20px; text-align: center;
          font-size: 13px; color: var(--t3);
        }

        @media (min-width: 640px) {
          .tl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (min-width: 1024px) {
          .tl-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="tl-sh">
        <div>
          <h2>Trainers</h2>
          <p>{trainers.length} trainer{trainers.length !== 1 ? "s" : ""} — tap to manage</p>
        </div>
        <button className="tl-add" onClick={() => setShowAddTrainer(true)}>
          + Add Trainer
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="tl-grid">
        {trainers.map((t) => {
          const clientCount = clients.filter((c) => c.trainerId === t.id).length;
          const isSuspended = t.status === "suspended";

          return (
            <div
              key={t.id}
              className={`tl-card ${isSuspended ? "tl-card-suspended" : ""}`}
              onClick={() => setSelectedTrainer(t)}
            >
              <div className="tl-body">

                {/* Avatar + name + score ring */}
                <div className="tl-top">
                  <div className="tl-av">{t.avatar}</div>
                  <div className="tl-info">
                    <div className="tl-name">{t.name}</div>
                    <div className="tl-spec">{t.speciality}</div>
                  </div>
                  <ScoreRing score={t.accountabilityScore || 0} size={44} />
                </div>

                {/* Badges */}
                <div className="tl-badges">
                  <span className={`tl-badge ${isSuspended ? "tl-badge-r" : "tl-badge-g"}`}>
                    {t.status}
                  </span>
                  <span className={`tl-badge ${t.plan === "Pro" ? "tl-badge-o" : "tl-badge-d"}`}>
                    {t.plan}
                  </span>
                  {(t.warnings || 0) > 0 && (
                    <span className="tl-badge tl-badge-w">⚠ {t.warnings ?? 0} warning{(t.warnings ?? 0) > 1 ? "s" : ""}</span>
                  )}
                </div>

                {/* Mini stats */}
                <div className="tl-stats">
                  <div className="tl-stat">
                    <div className="tl-stat-v" style={{ color: "var(--blue)" }}>{clientCount}</div>
                    <div className="tl-stat-k">Clients</div>
                  </div>
                  <div className="tl-stat">
                    <div className="tl-stat-v" style={{ color: "var(--t1)" }}>{t.retention || 0}%</div>
                    <div className="tl-stat-k">Retention</div>
                  </div>
                  <div className="tl-stat">
                    <div className="tl-stat-v" style={{ color: "var(--green)" }}>
                      ₹{((t.revenue || 0) / 1000).toFixed(0)}K
                    </div>
                    <div className="tl-stat-k">Revenue</div>
                  </div>
                </div>

              </div>

              {/* Action footer */}
              <div className="tl-foot" onClick={(e) => e.stopPropagation()}>
                <button
                  className="tl-btn tl-btn-s"
                  onClick={() => {
                    setNewClient((p: any) => ({ ...p, trainerId: t.id, trainerName: t.name }));
                    setShowAddClient(true);
                  }}
                >
                  + Client
                </button>
                <button
                  className="tl-btn tl-btn-s"
                  onClick={() => { setPwTarget(t); setShowChangePw(true); }}
                >
                  🔑 Password
                </button>
                <button
                  className={`tl-btn ${isSuspended ? "tl-btn-activate" : "tl-btn-suspend"}`}
                  onClick={() => toggleTrainerStatus(t.id, t.status || "active")}
                >
                  {isSuspended ? "✓ Activate" : "Suspend"}
                </button>
              </div>
            </div>
          );
        })}

        {trainers.length === 0 && (
          <div className="tl-empty">No trainers yet. Add your first trainer above.</div>
        )}
      </div>
    </>
  );
}
