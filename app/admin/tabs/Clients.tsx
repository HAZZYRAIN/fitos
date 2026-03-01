"use client";
import { useRouter } from "next/navigation";
import { useAdmin } from "../AdminContext";

export default function Clients() {
  const router = useRouter();
  const {
    clients, trainers,
    filteredClients, clientSearch, setClientSearch,
    trainerFilter, setTrainerFilter,
    clientStatusFilter, setClientStatusFilter,
    setShowAddClient,
  } = useAdmin();

  return (
    <>
      <div className="sh">
        <div className="sh-l"><h2>Client Oversight</h2><p>{filteredClients.length} of {clients.length} clients</p></div>
        <div className="row gap8">
          <input className="fi" style={{ width: 180 }} placeholder="Search name or trainer..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
          <select className="fi" style={{ width: 120 }} value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
            <option value="all">All Trainers</option>
            {trainers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <select className="fi" style={{ width: 110 }} value={clientStatusFilter} onChange={(e) => setClientStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-p btn-s" onClick={() => setShowAddClient(true)}>+ Add Client</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Client</th><th>Status</th><th>Trainer</th><th>Attendance</th>
                <th>Missed</th><th>Sessions Left</th><th>Progress</th>
                <th>Plan</th><th>Expires</th><th>Risk</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c) => {
                const expired = c.endDate && new Date(c.endDate) < new Date() && c.status !== "Inactive";
                const lowSessions = (c.classesLeft || 0) <= 2 && (c.sessionsIncluded || 0) > 0;
                const lowAttend = (c.compliance || 0) < 70;
                const riskCount = [expired, lowSessions, lowAttend].filter(Boolean).length;
                const goToProfile = () => router.push(`/admin/clients/${c.trainerId}/${c.id}`);
                return (
                  <tr
                    key={c.id}
                    style={{ cursor: "pointer", opacity: c.status === "Inactive" ? 0.6 : 1 }}
                    onClick={goToProfile}
                  >
                    <td><div className="col gap4"><span className="t1 fw6 fs13">{c.name}</span><span className="fs10 t3">{c.programType}</span></div></td>
                    <td><span className={`badge fs10 ${c.status === "Inactive" ? "bgr" : "bg"}`}>{c.status === "Inactive" ? "inactive" : "active"}</span></td>
                    <td className="fs12">{c.trainerName}</td>
                    <td>
                      <div className="row gap8">
                        <div className="pw" style={{ width: 44 }}>
                          <div className={`pb ${(c.compliance || 0) >= 85 ? "pb-g" : (c.compliance || 0) >= 70 ? "pb-y" : "pb-r"}`} style={{ width: `${c.compliance || 0}%` }} />
                        </div>
                        <span className="fs11 fw7">{c.compliance || 0}%</span>
                      </div>
                    </td>
                    <td><span className={(c.missedSessions || 0) > 3 ? "tr fw7" : "t2"}>{c.missedSessions || 0}</span></td>
                    <td><span className={`fw7 ${(c.classesLeft || 0) <= 2 ? "tr" : (c.classesLeft || 0) <= 5 ? "ty" : "tg"}`}>{c.classesLeft || 0}</span></td>
                    <td className="fs11 t3">{c.progressLastUpdated || "Never"}</td>
                    <td className="fs11 t3">{c.plan || "—"}</td>
                    <td className="fs11 t3">{c.endDate || "—"}</td>
                    <td>
                      {riskCount === 0
                        ? <span className="badge bg fs10">✓ OK</span>
                        : <span className="badge br fs10">{riskCount} flag{riskCount > 1 ? "s" : ""}</span>}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-g btn-xs" onClick={goToProfile}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
