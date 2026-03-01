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
      <div className="sh">
        <div className="sh-l"><h2>Trainers</h2><p>{trainers.length} trainers — click any to manage</p></div>
        <button className="btn btn-p btn-s" onClick={() => setShowAddTrainer(true)}>+ Add Trainer</button>
      </div>
      <div className="g3">
        {trainers.map((t) => (
          <div key={t.id} className="cc" style={{ opacity: t.status === "suspended" ? 0.6 : 1 }} onClick={() => setSelectedTrainer(t)}>
            <div className="row mb12">
              <div className="av av-t" style={{ width: 40, height: 40 }}>{t.avatar}</div>
              <div style={{ marginLeft: 10 }}>
                <div className="fw7 fs14 t1">{t.name}</div>
                <div className="fs11 t3">{t.speciality}</div>
              </div>
              <div className="mla"><ScoreRing score={t.accountabilityScore || 0} size={44} /></div>
            </div>
            <div className="row mb12 gap8">
              <span className={`badge fs10 ${t.status === "active" ? "bg" : "br"}`}>{t.status}</span>
              <span className={`badge fs10 ${t.plan === "Pro" ? "bo" : "bgr"}`}>{t.plan}</span>
              {(t.warnings || 0) > 0 && <span className="badge br fs10">⚠ {t.warnings}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
              {[
                { v: clients.filter((c) => c.trainerId === t.id).length, k: "Clients" },
                { v: `${t.retention || 0}%`, k: "Retention" },
                { v: `₹${((t.revenue || 0) / 1000).toFixed(0)}K`, k: "Revenue" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--s2)", borderRadius: "var(--rs)", padding: "8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 800, color: i === 2 ? "var(--green)" : "var(--t1)" }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{s.k}</div>
                </div>
              ))}
            </div>
            <div className="row gap8 mt12" onClick={(e) => e.stopPropagation()}>
              <button className="btn btn-g btn-xs" onClick={() => { setNewClient((p: any) => ({ ...p, trainerId: t.id, trainerName: t.name })); setShowAddClient(true); }}>+ Client</button>
              <button className="btn btn-g btn-xs" onClick={() => { setPwTarget(t); setShowChangePw(true); }}>🔑 Password</button>
              <button className={`btn btn-xs mla ${t.status === "active" ? "btn-dn" : "btn-ok"}`} onClick={() => toggleTrainerStatus(t.id, t.status || "active")}>
                {t.status === "active" ? "Suspend" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
