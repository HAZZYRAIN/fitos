"use client";
import { useAdmin } from "../AdminContext";

export default function Revenue() {
  const { clients, setSelectedClient } = useAdmin();

  return (
    <>
      <div className="sh"><div className="sh-l"><h2>Revenue & Plan Tracker</h2><p>Sessions sold vs delivered · Renewal risk</p></div></div>
      <div className="g4">
        {[
          { l: "Sessions Sold (Feb)", v: clients.reduce((s, c) => s + (c.sessionsIncluded || 0), 0), c: "var(--brand)" },
          { l: "Sessions Delivered", v: clients.reduce((s, c) => s + (c.sessionsLogged || 0), 0), c: "var(--green)" },
          { l: "Renewal Risk", v: clients.filter((c) => (c.classesLeft || 0) <= 3 || c.status === "On Hold" || (c.compliance || 0) < 70).length, c: "var(--red)" },
          { l: "Inactive Clients", v: clients.filter((c) => c.status === "Inactive").length, c: "var(--yellow)" },
        ].map((s, i) => (
          <div key={i} className="sc">
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c, fontSize: 28 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">Plan Consumption</span></div>
          {clients.map((c) => (
            <div key={c.id} className="row" style={{ padding: "10px 0", borderBottom: "1px solid var(--b1)", cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
              <div style={{ minWidth: 120 }}><div className="fw6 fs13 t1">{c.name}</div><div className="fs10 t3">{c.trainerName}</div></div>
              <div style={{ flex: 1, margin: "0 12px" }}>
                <div className="pw" style={{ height: 6 }}><div className={`pb ${(c.classesLeft || 0) <= 2 ? "pb-r" : (c.classesLeft || 0) <= 5 ? "pb-y" : "pb-g"}`} style={{ height: "100%", width: `${(c.sessionsIncluded || 0) > 0 ? ((c.sessionsLogged || 0) / c.sessionsIncluded) * 100 : 0}%`, borderRadius: 4 }} /></div>
                <div className="row mt4"><span className="fs10 t3">{c.sessionsLogged || 0} used</span><span className="fs10 t3 mla">{c.classesLeft || 0} left</span></div>
              </div>
              <span className={`badge fs10 ${(c.classesLeft || 0) <= 2 ? "br" : (c.classesLeft || 0) <= 5 ? "by" : "bg"}`}>{c.classesLeft || 0}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ch"><span className="ct">🔄 Renewal Risk</span><span className="badge br">{clients.filter((c) => (c.classesLeft || 0) <= 3 || c.status === "On Hold" || (c.compliance || 0) < 70).length}</span></div>
          <div className="col gap8">
            {clients.filter((c) => (c.classesLeft || 0) <= 3 || c.status === "On Hold" || (c.compliance || 0) < 70).map((c) => (
              <div key={c.id} className="card-sm" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>
                <div className="row"><span className="fw7 fs13 t1">{c.name}</span><span className={`badge fs10 mla ${c.status === "On Hold" ? "by" : "br"}`}>{c.status}</span></div>
                <div className="col gap4 mt4">
                  {(c.classesLeft || 0) <= 3 && <span className="fs11 tr">• {c.classesLeft || 0} sessions left</span>}
                  {(c.compliance || 0) < 70 && <span className="fs11 ty">• Attendance: {c.compliance || 0}%</span>}
                  {c.status === "On Hold" && <span className="fs11 ty">• Expires: {c.endDate}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
