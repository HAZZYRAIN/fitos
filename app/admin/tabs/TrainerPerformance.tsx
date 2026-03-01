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
      <div className="sh"><div className="sh-l"><h2>Trainer Performance</h2><p>Click any row to open trainer profile</p></div></div>
      <div className="card" style={{ padding: 0 }}>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Trainer</th><th>Score</th><th>Sessions</th><th>Missed</th><th>Pending Logs</th><th>Avg Compliance</th><th>Progress Updates</th><th>Late Logs</th><th>Warnings</th><th>Action</th></tr>
            </thead>
            <tbody>
              {trainers.map((t) => {
                const tClients = clients.filter((c) => c.trainerId === t.id);
                const avgComp = tClients.length ? Math.round(tClients.reduce((s, c) => s + (c.compliance || 0), 0) / tClients.length) : 0;
                return (
                  <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => setSelectedTrainer(t)}>
                    <td>
                      <div className="row gap8">
                        <div className="av av-t" style={{ width: 28, height: 28, fontSize: 10 }}>{t.avatar}</div>
                        <div><div className="t1 fw6 fs13">{t.name}</div><div className="fs10 t3">{t.speciality}</div></div>
                        {t.status === "suspended" && <span className="badge br fs10">suspended</span>}
                      </div>
                    </td>
                    <td><ScoreRing score={t.accountabilityScore || 0} size={44} /></td>
                    <td><span className={`fw7 ${(t.sessions || 0) < (t.sessionsAssigned || 0) * 0.9 ? "tr" : "tg"}`}>{t.sessions || 0}/{t.sessionsAssigned || 0}</span></td>
                    <td><span className={(t.missedSessions || 0) > 3 ? "tr fw7" : "t2"}>{t.missedSessions || 0}</span></td>
                    <td><span className={(t.pendingLogs || 0) > 0 ? "ty fw7" : "tg"}>{(t.pendingLogs || 0) === 0 ? "✓ Clear" : `${t.pendingLogs} pending`}</span></td>
                    <td>
                      <div className="row gap8">
                        <div className="pw" style={{ width: 50 }}><div className={`pb ${avgComp >= 85 ? "pb-g" : avgComp >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${avgComp}%` }} /></div>
                        <span className="fs11 fw7">{avgComp}%</span>
                      </div>
                    </td>
                    <td><span className={(t.progressUpdatesThisMonth || 0) < 10 ? "ty" : "tg"}>{t.progressUpdatesThisMonth || 0}</span></td>
                    <td><span className={(t.lateSubmissions || 0) > 2 ? "tr fw7" : (t.lateSubmissions || 0) > 0 ? "ty" : "tg"}>{(t.lateSubmissions || 0) === 0 ? "✓ None" : t.lateSubmissions}</span></td>
                    <td><span className={(t.warnings || 0) > 0 ? "tr fw7" : "tg"}>{(t.warnings || 0) === 0 ? "✓ Clean" : `${t.warnings} ⚠`}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row gap4">
                        <button className="btn btn-warn btn-xs" onClick={() => { setNewWarning((p: any) => ({ ...p, trainer: t.name })); setShowWarning(true); }}>Warn</button>
                        <button className="btn btn-g btn-xs" onClick={() => { setPwTarget(t); setShowChangePw(true); }}>🔑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="ch"><span className="ct">Client Drop-off Risk by Trainer</span></div>
        <div className="g3">
          {trainers.map((t) => {
            const mine = clients.filter((c) => c.trainerId === t.id);
            const atRisk = mine.filter((c) => (c.missedSessions || 0) > 3 || (c.compliance || 0) < 70);
            return (
              <div key={t.id} className="card-sm">
                <div className="row mb8">
                  <div className="av av-t" style={{ width: 26, height: 26, fontSize: 10 }}>{t.avatar}</div>
                  <span className="fw7 fs13" style={{ marginLeft: 8, cursor: "pointer" }} onClick={() => setSelectedTrainer(t)}>{t.name}</span>
                  <span className={`badge fs10 mla ${atRisk.length > 0 ? "br" : "bg"}`}>{atRisk.length > 0 ? `${atRisk.length} at risk` : "All good"}</span>
                </div>
                {atRisk.map((c) => (
                  <div key={c.id} className="fs11 t3 mt4" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>• {c.name} — {c.compliance || 0}% · {c.missedSessions || 0} missed</div>
                ))}
                {atRisk.length === 0 && <div className="fs11 tg">No drop-off risks</div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
