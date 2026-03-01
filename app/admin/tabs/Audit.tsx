"use client";

const AUDIT_LOGS = [
  { actor: "Gokul", action: "Logged session for", target: "Rajesh Kumar", detail: "Strength Training · 65 min", time: "Feb 27, 10:12am", type: "log" },
  { actor: "Sreekanta", action: "Updated progress for", target: "Ananya Iyer", detail: "Weight: 71kg → updated", time: "Feb 27, 9:44am", type: "update" },
  { actor: "Admin", action: "Posted instruction:", target: "Holi Holiday Mar 14", detail: "Priority: High", time: "Feb 28, 9:00am", type: "admin" },
  { actor: "Aman", action: "Logged session for", target: "Deepika Singh", detail: "Modified — reduced intensity", time: "Feb 26, 6:15pm", type: "modified" },
  { actor: "Admin", action: "Logged warning for", target: "Aman", detail: "Late log submissions", time: "Feb 10, 3:00pm", type: "warning" },
];

export default function Audit() {
  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Audit Trail</h2><p>Every change logged</p></div>
        <button className="btn btn-g btn-s">Export CSV</button>
      </div>
      <div className="card">
        {AUDIT_LOGS.map((log, i) => (
          <div key={i} className="ai">
            <div className="ad" style={{ background: log.type === "warning" ? "var(--red)" : log.type === "admin" ? "var(--brand)" : log.type === "modified" ? "var(--purple)" : "var(--green)" }} />
            <div style={{ flex: 1 }}>
              <div className="row gap8">
                <span className="fw6 fs13 t1">{log.actor}</span>
                <span className="fs12 t3">{log.action}</span>
                <span className="fs12 to fw6">{log.target}</span>
              </div>
              <div className="fs11 t3 mt4">{log.detail}</div>
            </div>
            <span className="fs10 t3" style={{ whiteSpace: "nowrap" }}>{log.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}
