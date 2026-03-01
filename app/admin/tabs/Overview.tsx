"use client";
import { useAdmin } from "../AdminContext";
import { BarChart, Donut } from "../../components/ui/Charts";

const revData = [
  { l: "Sep", v: 98000 }, { l: "Oct", v: 112000 }, { l: "Nov", v: 128000 },
  { l: "Dec", v: 118000 }, { l: "Jan", v: 142000 }, { l: "Feb", v: 162400 },
];

export default function Overview() {
  const {
    clients, trainers, sessionLogs,
    totalRevenue, pendingLogs, avgAccountability,
    atRiskClients, expiredClients, lowClassClients,
    todaySessions, setTab, setSelectedClient,
  } = useAdmin();

  return (
    <>
      <div className="sh"><div className="sh-l"><h2>Control Room</h2><p>Live platform overview</p></div></div>
      <div className="g4">
        {[
          { l: "Total Revenue (Feb)", v: `₹${(totalRevenue / 1000).toFixed(0)}K`, s: "All trainers combined", d: "+14.2%", up: true, c: "var(--brand)" },
          { l: "Active Clients", v: clients.filter((c) => c.status !== "Inactive").length, s: `${clients.filter((c) => c.status === "Active").length} paid active`, d: "+4 this month", up: true, c: "var(--blue)" },
          { l: "Pending Session Logs", v: pendingLogs, s: "Must be logged today", d: pendingLogs > 0 ? "Action needed" : "All clear", up: pendingLogs === 0, c: pendingLogs > 0 ? "var(--red)" : "var(--green)" },
          { l: "Avg Accountability", v: `${avgAccountability}%`, s: "Across all trainers", d: "+2% vs last month", up: true, c: "var(--purple)" },
        ].map((s, i) => (
          <div key={i} className="sc" style={{ cursor: i === 1 ? "pointer" : "default" }} onClick={i === 1 ? () => setTab("clients") : undefined}>
            <div className="sc-bar" style={{ background: `linear-gradient(90deg,${s.c},${s.c}55)` }} />
            <div className="sl">{s.l}</div>
            <div className="sv" style={{ color: s.c }}>{s.v}</div>
            <div className="ss">{s.s}</div>
            <div className={`sd ${s.up ? "sup" : "sdn"}`}>{s.up ? "▲" : "▼"} {s.d}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">Today's Sessions</span><span className="badge bb">{todaySessions.length} total</span></div>
          {todaySessions.length === 0 && <div className="fs12 t3">No sessions logged today yet.</div>}
          {todaySessions.map((s) => (
            <div key={s.id} className="ai">
              <div className="ad" style={{ background: s.status === "completed" ? "var(--green)" : s.status === "missed" ? "var(--red)" : "var(--yellow)" }} />
              <div style={{ flex: 1 }}>
                <div className="row gap8">
                  <span className="fw6 fs13 t1" style={{ cursor: "pointer" }} onClick={() => { const c = clients.find((cl) => cl.name === s.client); if (c) setSelectedClient(c); }}>{s.client}</span>
                  <span className="fs10 t3">→ {s.trainer}</span>
                  <span className={`badge fs10 mla ${s.status === "completed" ? "bg" : s.status === "missed" ? "br" : "by"}`}>{s.status}</span>
                </div>
                <div className="fs11 t3 mt4">{s.type} · {s.date} {s.late && <span className="overdue-tag" style={{ marginLeft: 4 }}>LATE LOG</span>}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ch"><span className="ct">Urgent Alerts</span><span className="badge br">{atRiskClients.length + pendingLogs} items</span></div>
          <div className="col gap8">
            {pendingLogs > 0 && <div className="alert al-r" style={{ cursor: "pointer" }} onClick={() => setTab("sessions")}>📝 {pendingLogs} session logs pending</div>}
            {expiredClients.map((c) => <div key={c.id} className="alert al-r" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>📅 {c.name} — plan expired {c.endDate}</div>)}
            {lowClassClients.map((c) => <div key={c.id} className="alert al-y" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>⚠ {c.name} — {c.classesLeft} class{c.classesLeft === 1 ? "" : "es"} left</div>)}
            {clients.filter((c) => (c.compliance || 0) < 70).map((c) => <div key={c.id} className="alert al-y" style={{ cursor: "pointer" }} onClick={() => setSelectedClient(c)}>📉 {c.name} — {c.compliance || 0}% attendance</div>)}
          </div>
        </div>
      </div>
      <div className="g32">
        <div className="card">
          <div className="ch"><span className="ct">Revenue Trend</span><span className="badge bg">₹{(totalRevenue / 1000).toFixed(0)}K MTD</span></div>
          <BarChart data={revData} color="var(--brand)" />
        </div>
        <div className="card">
          <div className="ch"><span className="ct">Platform Health</span></div>
          <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 0" }}>
            <Donut value={trainers.length ? Math.round(trainers.reduce((s, t) => s + (t.retention || 0), 0) / trainers.length) : 0} color="var(--green)" label="Retention" />
            <Donut value={avgAccountability} color="var(--brand)" label="Accountability" />
            <Donut value={clients.length ? Math.round(clients.reduce((s, c) => s + (c.compliance || 0), 0) / clients.length) : 0} color="var(--blue)" label="Compliance" />
          </div>
        </div>
      </div>
    </>
  );
}
