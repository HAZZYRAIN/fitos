"use client";
import { useAdmin } from "../AdminContext";

export default function Sessions() {
  const { clients, trainers, sessionLogs, pendingLogs, setSelectedClient, setSelectedTrainer } = useAdmin();

  return (
    <>
      <div className="sh"><div className="sh-l"><h2>Session Logs</h2><p>All trainer submissions — late logs flagged</p></div></div>
      {pendingLogs > 0 && <div className="alert al-r">🚨 {pendingLogs} session logs NOT submitted.</div>}
      <div className="card" style={{ padding: 0 }}>
        <div className="tw">
          <table>
            <thead><tr><th>Client</th><th>Trainer</th><th>Date</th><th>Type</th><th>Status</th><th>Duration</th><th>Logged</th><th>Late?</th><th>Notes</th></tr></thead>
            <tbody>
              {sessionLogs.map((s) => (
                <tr key={s.id}>
                  <td className="t1 fw6" style={{ cursor: "pointer" }} onClick={() => { const c = clients.find((cl) => cl.name === s.client); if (c) setSelectedClient(c); }}>{s.client}</td>
                  <td className="fs12" style={{ cursor: "pointer" }} onClick={() => { const t = trainers.find((tr) => tr.name === s.trainer); if (t) setSelectedTrainer(t); }}>{s.trainer}</td>
                  <td className="fs11 t3">{s.date}</td>
                  <td><span className="badge bgr fs10">{s.type}</span></td>
                  <td><span className={`badge fs10 ${s.status === "completed" ? "bg" : s.status === "missed" ? "br" : s.status === "cancelled" ? "by" : "bb"}`}>{s.status}</span></td>
                  <td className="fs12">{s.duration > 0 ? `${s.duration} min` : "—"}</td>
                  <td className="fs11 t3">{s.loggedAt}</td>
                  <td>{s.late ? <span className="overdue-tag">LATE</span> : <span className="tg fs11">✓</span>}</td>
                  <td className="fs11 t2" style={{ maxWidth: 180 }}>{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
