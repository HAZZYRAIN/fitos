"use client";
import { useAdmin } from "../AdminContext";

export default function Flags() {
  const {
    trainers, sessionLogs,
    flaggedClients, lowAttendance, expiredClients,
    setSelectedClient, setSelectedTrainer,
  } = useAdmin();

  return (
    <>
      <div className="sh"><div className="sh-l"><h2>Flags & Alerts</h2><p>Click any item to open profile</p></div></div>
      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">🚨 Risk Flags</span><span className="badge br">{flaggedClients.length}</span></div>
          <div className="col gap8">
            {flaggedClients.map((c) => (
              <div key={c.id} className="flag-card" style={{ borderColor: "var(--yellow)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                <div className="row"><span className="fw6 fs13 t1">{c.name}</span><span className="fs11 t3 mla">{c.trainerName}</span></div>
                <div className="fs11 t3 mt4">{c.medicalNotes}</div>
              </div>
            ))}
            {flaggedClients.length === 0 && <div className="fs12 tg">No active risk flags</div>}
          </div>
        </div>
        <div className="card">
          <div className="ch"><span className="ct">📉 Low Attendance</span><span className="badge by">{lowAttendance.length}</span></div>
          <div className="col gap8">
            {lowAttendance.map((c) => (
              <div key={c.id} className="flag-card" style={{ borderColor: "var(--yellow)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                <div className="row"><span className="fw6 fs13 t1">{c.name}</span><span className="badge by fs10 mla">{c.compliance || 0}%</span></div>
                <div className="fs11 t3 mt4">{c.trainerName} · {c.missedSessions || 0} missed</div>
              </div>
            ))}
            {lowAttendance.length === 0 && <div className="fs12 tg">All clients above 70%</div>}
          </div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">⏰ Late Log Submissions</span></div>
          <div className="col gap8">
            {sessionLogs.filter((s) => s.late).map((s) => (
              <div key={s.id} className="flag-card" style={{ borderColor: "var(--yellow)", cursor: "pointer" }} onClick={() => { const t = trainers.find((tr) => tr.name === s.trainer); if (t) setSelectedTrainer(t); }}>
                <div className="row"><span className="fw6 fs13 t1">{s.trainer}</span><span className="overdue-tag mla">LATE</span></div>
                <div className="fs11 t3 mt4">Session with {s.client} on {s.date}</div>
              </div>
            ))}
            {sessionLogs.filter((s) => s.late).length === 0 && <div className="fs12 tg">No late submissions</div>}
          </div>
        </div>
        <div className="card">
          <div className="ch"><span className="ct">📅 Expiring Plans</span></div>
          <div className="col gap8">
            {expiredClients.map((c) => (
              <div key={c.id} className="flag-card" style={{ borderColor: "var(--red)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                <div className="row"><span className="fw6 fs13 t1">{c.name}</span><span className="overdue-tag mla">EXPIRED</span></div>
                <div className="fs11 t3 mt4">Ended: {c.endDate} · {c.classesLeft || 0} sessions left</div>
              </div>
            ))}
            {expiredClients.length === 0 && <div className="fs12 tg">No expired plans</div>}
          </div>
        </div>
      </div>
    </>
  );
}
