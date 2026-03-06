"use client";
import { useState } from "react";
import { useAdmin } from "./AdminContext";

export default function TrainerEditor() {
  const {
    selectedTrainer, setSelectedTrainer,
    clients,
  } = useAdmin();

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details"); // details | clients | stats
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // When a trainer is selected, initialize editData
  const handleEditClick = () => {
    setEditData({ ...selectedTrainer });
    setEditMode(true);
    setMsg("");
  };

  const handleSave = async () => {
    if (!editData || !editData.id) return;
    setSaving(true);
    setMsg("");

    try {
      const { db } = await import("../../lib/firebase");
      const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");

      await updateDoc(doc(db, "trainers", editData.id), {
        ...editData,
        updatedAt: serverTimestamp(),
      });

      // Update selected trainer in UI
      setSelectedTrainer({ ...editData });
      setEditMode(false);
      setMsg("✓ Changes saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setMsg("✕ Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const trainerClients = selectedTrainer
    ? clients.filter((c) => c.trainerId === selectedTrainer.id)
    : [];

  if (!selectedTrainer) return null;

  return (
    <>
      <style>{`
        .te-modal { 
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .te-container {
          background: var(--bg1); border: 1px solid var(--b0);
          border-radius: 16px; width: 100%; max-width: 700px;
          max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        /* Header */
        .te-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px; border-bottom: 1px solid var(--b0);
          position: sticky; top: 0; background: var(--bg1); z-index: 10;
        }
        .te-header-left { display: flex; align-items: center; gap: 12px; }
        .te-av {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--brand1); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800;
        }
        .te-info h3 { margin: 0; font-size: 15px; font-weight: 800; color: var(--t1); }
        .te-info p { margin: 3px 0 0; font-size: 11px; color: var(--t3); }
        .te-close {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--bg2); border: 1px solid var(--b0);
          font-size: 18px; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          border: none; font-family: inherit;
        }

        /* Tabs */
        .te-tabs {
          display: flex; gap: 0; border-bottom: 1px solid var(--b0);
          padding: 0 20px; background: var(--bg1);
          position: sticky; top: 60px; z-index: 9;
        }
        .te-tab {
          flex: 1; padding: 12px; text-align: center;
          font-size: 13px; font-weight: 700; color: var(--t3);
          border: none; background: none; cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-family: inherit;
        }
        .te-tab.on {
          color: var(--brand1); border-bottom-color: var(--brand1);
        }

        /* Content */
        .te-content { padding: 20px; }

        /* Section */
        .te-section { margin-bottom: 24px; }
        .te-section-title {
          font-size: 12px; font-weight: 800; color: var(--t4);
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        /* Grid */
        .te-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .te-grid.full { grid-template-columns: 1fr; }

        /* Field */
        .te-field { display: flex; flex-direction: column; gap: 6px; }
        .te-label {
          font-size: 12px; font-weight: 700; color: var(--t1);
        }
        .te-input {
          padding: 10px 12px; border-radius: 8px;
          border: 1.5px solid var(--b0); background: var(--bg2);
          font-size: 13px; color: var(--t1); font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .te-input:focus { border-color: var(--brand1); background: var(--bg1); }
        .te-select { padding: 10px 12px; border-radius: 8px; border: 1.5px solid var(--b0); background: var(--bg2); font-size: 13px; color: var(--t1); font-family: inherit; cursor: pointer; outline: none; }

        /* Client list */
        .te-client-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px; background: var(--bg2); border: 1px solid var(--b0);
          border-radius: 8px; margin-bottom: 8px;
        }
        .te-client-info { flex: 1; }
        .te-client-name { font-size: 13px; font-weight: 700; color: var(--t1); }
        .te-client-detail { font-size: 11px; color: var(--t3); margin-top: 2px; }
        .te-client-remove {
          padding: 6px 12px; font-size: 11px; background: rgba(239,68,68,0.1);
          color: #ef4444; border: 1px solid rgba(239,68,68,0.2);
          border-radius: 6px; cursor: pointer; font-weight: 700;
          font-family: inherit;
        }

        /* Stats */
        .te-stat-row {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
        }
        .te-stat-card {
          background: var(--bg2); border: 1px solid var(--b0);
          border-radius: 8px; padding: 12px; text-align: center;
        }
        .te-stat-value {
          font-size: 20px; font-weight: 800; font-family: var(--fd);
          color: var(--brand1);
        }
        .te-stat-label {
          font-size: 10px; color: var(--t3); margin-top: 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
        }

        /* Actions */
        .te-actions {
          display: flex; gap: 10px;
          padding: 20px; border-top: 1px solid var(--b0);
          background: var(--bg2); position: sticky; bottom: 0;
        }
        .te-btn {
          flex: 1; padding: 12px; border-radius: 8px; border: none;
          font-size: 13px; font-weight: 800; cursor: pointer;
          font-family: inherit; transition: opacity 0.2s;
        }
        .te-btn:active { opacity: 0.8; }
        .te-btn-g { background: var(--bg1); color: var(--t1); border: 1px solid var(--b0); }
        .te-btn-p { background: var(--brand1); color: #fff; }
        .te-msg {
          padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
          margin-bottom: 16px;
        }
        .te-msg-ok { background: rgba(34,197,94,0.1); color: #22c55e; }
        .te-msg-err { background: rgba(239,68,68,0.1); color: #ef4444; }

        .te-disabled { opacity: 0.6; pointer-events: none; }
      `}</style>

      <div className="te-modal" onClick={() => !editMode && setSelectedTrainer(null)}>
        <div className="te-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="te-header">
            <div className="te-header-left">
              <div className="te-av">
                {selectedTrainer.avatar || selectedTrainer.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="te-info">
                <h3>{selectedTrainer.name}</h3>
                <p>{selectedTrainer.speciality}</p>
              </div>
            </div>
            <button className="te-close" onClick={() => setSelectedTrainer(null)}>✕</button>
          </div>

          {/* Tabs */}
          {!editMode && (
            <div className="te-tabs">
              <button className={`te-tab ${activeTab === "details" ? "on" : ""}`} onClick={() => setActiveTab("details")}>
                Details
              </button>
              <button className={`te-tab ${activeTab === "clients" ? "on" : ""}`} onClick={() => setActiveTab("clients")}>
                Clients ({trainerClients.length})
              </button>
              <button className={`te-tab ${activeTab === "stats" ? "on" : ""}`} onClick={() => setActiveTab("stats")}>
                Performance
              </button>
            </div>
          )}

          {/* Content */}
          <div className="te-content">
            {msg && <div className={`te-msg ${msg.startsWith("✓") ? "te-msg-ok" : "te-msg-err"}`}>{msg}</div>}

            {!editMode ? (
              <>
                {/* DETAILS TAB */}
                {activeTab === "details" && (
                  <div>
                    <div className="te-section">
                      <div className="te-section-title">Account Info</div>
                      <div className="te-grid">
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Name</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{selectedTrainer.name}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Email</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{selectedTrainer.email || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Status</div>
                          <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 6, background: selectedTrainer.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: selectedTrainer.status === "active" ? "#22c55e" : "#ef4444" }}>
                            {selectedTrainer.status}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Plan</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{selectedTrainer.plan}</div>
                        </div>
                      </div>
                    </div>

                    <div className="te-section">
                      <div className="te-section-title">Specialization</div>
                      <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6 }}>{selectedTrainer.speciality}</div>
                    </div>

                    <div className="te-section">
                      <div className="te-section-title">Additional Info</div>
                      <div className="te-grid">
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Joined</div>
                          <div style={{ fontSize: 13, color: "var(--t1)" }}>{selectedTrainer.joined || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Rating</div>
                          <div style={{ fontSize: 13, color: "var(--t1)" }}>⭐ {selectedTrainer.rating || 0}/5</div>
                        </div>
                      </div>
                    </div>

                    <button className="te-btn te-btn-p" style={{ width: "100%", marginTop: 20 }} onClick={handleEditClick}>
                      ✏️ Edit Trainer Info
                    </button>
                  </div>
                )}

                {/* CLIENTS TAB */}
                {activeTab === "clients" && (
                  <div>
                    {trainerClients.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--t3)" }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>👥</div>
                        <div>No clients assigned yet</div>
                      </div>
                    ) : (
                      <div>
                        {trainerClients.map((c) => (
                          <div key={c.id} className="te-client-item">
                            <div className="te-client-info">
                              <div className="te-client-name">{c.name}</div>
                              <div className="te-client-detail">{c.programType} • {c.status}</div>
                              <div style={{ fontSize: 10, color: "var(--t4)", marginTop: 4 }}>
                                {c.sessionsLogged || 0}/{c.sessionsIncluded || 0} sessions • {c.compliance || 0}% compliance
                              </div>
                            </div>
                            <button className="te-client-remove" onClick={async () => {
                              if (window.confirm(`Remove ${c.name} from ${selectedTrainer.name}?`)) {
                                try {
                                  const { db } = await import("../../lib/firebase");
                                  const { deleteDoc, doc } = await import("firebase/firestore");
                                  
                                  await deleteDoc(doc(db, "trainers", selectedTrainer.id, "clients", c.id));
                                  setMsg(`✓ ${c.name} removed successfully!`);
                                  setTimeout(() => setMsg(""), 3000);
                                  // Force refresh by updating selectedTrainer
                                  setSelectedTrainer({ ...selectedTrainer });
                                } catch (err) {
                                  console.error("Error:", err);
                                  setMsg("✕ Failed to remove client.");
                                }
                              }
                            }}>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STATS TAB */}
                {activeTab === "stats" && (
                  <div>
                    <div className="te-section">
                      <div className="te-section-title">Performance Metrics</div>
                      <div className="te-stat-row">
                        <div className="te-stat-card">
                          <div className="te-stat-value">{selectedTrainer.sessions || 0}</div>
                          <div className="te-stat-label">Sessions Logged</div>
                        </div>
                        <div className="te-stat-card">
                          <div className="te-stat-value">{selectedTrainer.lateSubmissions || 0}</div>
                          <div className="te-stat-label">Late Submissions</div>
                        </div>
                        <div className="te-stat-card">
                          <div className="te-stat-value">{selectedTrainer.clientCount || 0}</div>
                          <div className="te-stat-label">Active Clients</div>
                        </div>
                        <div className="te-stat-card">
                          <div className="te-stat-value">{selectedTrainer.accountabilityScore || 0}%</div>
                          <div className="te-stat-label">Accountability</div>
                        </div>
                      </div>
                    </div>

                    <div className="te-section">
                      <div className="te-section-title">Financial</div>
                      <div className="te-grid">
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Total Revenue</div>
                          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", color: "var(--brand1)" }}>₹{(selectedTrainer.revenue || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--t4)", marginBottom: 4 }}>Retention Rate</div>
                          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--fd)", color: selectedTrainer.retention >= 80 ? "#22c55e" : "var(--brand1)" }}>
                            {selectedTrainer.retention || 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="te-btn te-btn-p" style={{ width: "100%", marginTop: 20 }} onClick={handleEditClick}>
                      ✏️ Edit Stats
                    </button>
                  </div>
                )}
              </>
            ) : (
              // EDIT MODE
              <div>
                <div className="te-section">
                  <div className="te-section-title">Account Information</div>
                  <div className="te-grid">
                    <div className="te-field">
                      <label className="te-label">Full Name</label>
                      <input className="te-input" type="text" value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Email</label>
                      <input className="te-input" type="email" value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Speciality</label>
                      <input className="te-input" type="text" value={editData.speciality || ""} onChange={(e) => setEditData({ ...editData, speciality: e.target.value })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Status</label>
                      <select className="te-select" value={editData.status || "active"} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="te-field">
                      <label className="te-label">Plan</label>
                      <select className="te-select" value={editData.plan || "Starter"} onChange={(e) => setEditData({ ...editData, plan: e.target.value })}>
                        <option value="Starter">Starter</option>
                        <option value="Pro">Pro</option>
                      </select>
                    </div>
                    <div className="te-field">
                      <label className="te-label">Joined Date</label>
                      <input className="te-input" type="text" value={editData.joined || ""} onChange={(e) => setEditData({ ...editData, joined: e.target.value })} placeholder="e.g. Mar 2024" />
                    </div>
                  </div>
                </div>

                <div className="te-section">
                  <div className="te-section-title">Performance Stats</div>
                  <div className="te-grid">
                    <div className="te-field">
                      <label className="te-label">Sessions Logged</label>
                      <input className="te-input" type="number" value={editData.sessions || 0} onChange={(e) => setEditData({ ...editData, sessions: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Late Submissions</label>
                      <input className="te-input" type="number" value={editData.lateSubmissions || 0} onChange={(e) => setEditData({ ...editData, lateSubmissions: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Active Clients</label>
                      <input className="te-input" type="number" value={editData.clientCount || 0} onChange={(e) => setEditData({ ...editData, clientCount: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Accountability Score (%)</label>
                      <input className="te-input" type="number" min="0" max="100" value={editData.accountabilityScore || 0} onChange={(e) => setEditData({ ...editData, accountabilityScore: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Total Revenue (₹)</label>
                      <input className="te-input" type="number" value={editData.revenue || 0} onChange={(e) => setEditData({ ...editData, revenue: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Retention Rate (%)</label>
                      <input className="te-input" type="number" min="0" max="100" value={editData.retention || 0} onChange={(e) => setEditData({ ...editData, retention: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Rating (★)</label>
                      <input className="te-input" type="number" min="0" max="5" step="0.1" value={editData.rating || 0} onChange={(e) => setEditData({ ...editData, rating: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Warnings</label>
                      <input className="te-input" type="number" value={editData.warnings || 0} onChange={(e) => setEditData({ ...editData, warnings: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>

                <div className="te-section">
                  <div className="te-section-title">Other Metrics</div>
                  <div className="te-grid">
                    <div className="te-field">
                      <label className="te-label">Missed Sessions</label>
                      <input className="te-input" type="number" value={editData.missedSessions || 0} onChange={(e) => setEditData({ ...editData, missedSessions: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Pending Logs</label>
                      <input className="te-input" type="number" value={editData.pendingLogs || 0} onChange={(e) => setEditData({ ...editData, pendingLogs: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Progress Updates This Month</label>
                      <input className="te-input" type="number" value={editData.progressUpdatesThisMonth || 0} onChange={(e) => setEditData({ ...editData, progressUpdatesThisMonth: Number(e.target.value) })} />
                    </div>
                    <div className="te-field">
                      <label className="te-label">Sessions Assigned</label>
                      <input className="te-input" type="number" value={editData.sessionsAssigned || 0} onChange={(e) => setEditData({ ...editData, sessionsAssigned: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="te-actions">
            {editMode && (
              <>
                <button className="te-btn te-btn-g" onClick={() => { setEditMode(false); setEditData(null); }}>
                  Cancel
                </button>
                <button className={`te-btn te-btn-p ${saving ? "te-disabled" : ""}`} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "✓ Save Changes"}
                </button>
              </>
            )}
            {!editMode && (
              <button className="te-btn te-btn-g" onClick={() => setSelectedTrainer(null)} style={{ flex: 1 }}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
