"use client";

import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

const mockData = {
  trainers: [
    { id: 1, name: "Gokul", email: "gokul@yourtrainer.com", avatar: "GK", clients: 18, retention: 84, revenue: 12400, sessions: 67, status: "active" },
    { id: 2, name: "Sreekanta", email: "sreekanta@yourtrainer.com", avatar: "SK", clients: 22, retention: 91, revenue: 16800, sessions: 89, status: "active" },
    { id: 3, name: "Aman", email: "aman@yourtrainer.com", avatar: "AM", clients: 14, retention: 71, revenue: 9200, sessions: 51, status: "active" },
  ],
  clients: [
    { id: 1, name: "Chris Park", trainer: "Gokul", goal: "Weight Loss", weight: 94, sessions: 24, compliance: 87, payment: "Active" },
    { id: 2, name: "Emma Davis", trainer: "Sreekanta", goal: "Muscle Gain", weight: 62, sessions: 31, compliance: 93, payment: "Active" },
    { id: 3, name: "Luis Gomez", trainer: "Gokul", goal: "Athletic Performance", weight: 78, sessions: 18, compliance: 71, payment: "Expiring" },
    { id: 4, name: "Zoe Kim", trainer: "Aman", goal: "Weight Loss", weight: 71, sessions: 42, compliance: 96, payment: "Active" },
  ],
  activityLogs: [
    { id: 1, actor: "Gokul", action: "Created workout plan", target: "Chris Park", time: "2 min ago", type: "create" },
    { id: 2, actor: "Sreekanta", action: "Logged payment received", target: "Emma Davis", time: "18 min ago", type: "payment" },
    { id: 3, actor: "Aman", action: "Updated body measurements", target: "Zoe Kim", time: "34 min ago", type: "update" },
    { id: 4, actor: "Admin", action: "Added new trainer", target: "Aman", time: "1 hr ago", type: "admin" },
  ],
  trainerClients: [
    { id: 1, name: "Chris Park", goal: "Weight Loss", compliance: 87, nextSession: "Mon 9am", payment: "Active", weight: 94, delta: -14, sessions: 24 },
    { id: 2, name: "Luis Gomez", goal: "Athletic Perf.", compliance: 71, nextSession: "Tue 7am", payment: "Expiring", weight: 78, delta: -2, sessions: 18 },
    { id: 3, name: "Felix Ito", goal: "Weight Loss", compliance: 91, nextSession: "Thu 8am", payment: "Active", weight: 88, delta: -8, sessions: 29 },
  ],
  clientProgress: [
    { week: "W1", weight: 94, strength: 60 }, { week: "W2", weight: 93.2, strength: 63 },
    { week: "W3", weight: 92.1, strength: 65 }, { week: "W4", weight: 91.4, strength: 68 },
    { week: "W5", weight: 90.8, strength: 71 }, { week: "W6", weight: 89.5, strength: 74 },
    { week: "W7", weight: 88.9, strength: 76 }, { week: "W8", weight: 88.1, strength: 79 },
  ]
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24; --surface3: #22222f;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
    --text: #f0f0f8; --text2: #9090a8; --text3: #5a5a70;
    --accent: #6c63ff; --green: #22c55e; --yellow: #f59e0b; --red: #ef4444; --cyan: #06b6d4;
    --font-display: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif;
    --radius: 12px; --radius-sm: 8px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 240px; min-width: 240px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
  .sidebar-logo { padding: 24px 20px 20px; border-bottom: 1px solid var(--border); }
  .logo-mark { font-family: var(--font-display); font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #6c63ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo-sub { font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .role-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
  .role-admin { background: rgba(108,99,255,0.2); color: #a78bfa; border: 1px solid rgba(108,99,255,0.3); }
  .role-trainer { background: rgba(6,182,212,0.2); color: #67e8f9; border: 1px solid rgba(6,182,212,0.3); }
  .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nav-section { padding: 8px 12px 4px; font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; cursor: pointer; border-radius: var(--radius-sm); margin: 1px 8px; font-size: 13.5px; color: var(--text2); transition: all 0.15s; font-weight: 500; border: 1px solid transparent; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: rgba(108,99,255,0.15); color: #a78bfa; border-color: rgba(108,99,255,0.25); }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
  .user-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); border: 1px solid var(--border); }
  .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .avatar-admin { background: linear-gradient(135deg, #6c63ff, #a78bfa); color: white; }
  .avatar-trainer { background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; }
  .avatar-client { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
  .user-name { font-size: 13px; font-weight: 600; }
  .user-role { font-size: 11px; color: var(--text3); }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 60px; min-height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 16px; }
  .topbar-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; flex: 1; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all 0.15s; border: none; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #7c73ff; }
  .btn-ghost { background: var(--surface2); color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--surface3); color: var(--text); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .btn-logout { width: 100%; margin-top: 8px; background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); padding: 8px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all 0.15s; }
  .btn-logout:hover { background: rgba(239,68,68,0.2); }
  .content { flex: 1; overflow-y: auto; padding: 24px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .grid-2-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card.purple::before { background: linear-gradient(90deg, #6c63ff, #a78bfa); }
  .stat-card.cyan::before { background: linear-gradient(90deg, #06b6d4, #0ea5e9); }
  .stat-card.green::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
  .stat-card.orange::before { background: linear-gradient(90deg, #f59e0b, #ef4444); }
  .stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 8px; }
  .stat-value { font-family: var(--font-display); font-size: 30px; font-weight: 800; line-height: 1; }
  .stat-delta { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; margin-top: 6px; }
  .delta-up { color: var(--green); }
  .delta-down { color: var(--red); }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid var(--border); font-weight: 600; }
  td { padding: 12px 14px; font-size: 13.5px; border-bottom: 1px solid var(--border); color: var(--text2); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.2); }
  .badge-red { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
  .badge-yellow { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.2); }
  .badge-purple { background: rgba(108,99,255,0.15); color: #a78bfa; border: 1px solid rgba(108,99,255,0.2); }
  .badge-gray { background: rgba(255,255,255,0.08); color: var(--text3); border: 1px solid var(--border); }
  .progress-wrap { background: var(--surface3); border-radius: 4px; overflow: hidden; height: 6px; }
  .progress-bar { height: 100%; border-radius: 4px; }
  .pb-green { background: linear-gradient(90deg, #22c55e, #16a34a); }
  .pb-yellow { background: linear-gradient(90deg, #f59e0b, #d97706); }
  .pb-purple { background: linear-gradient(90deg, #6c63ff, #a78bfa); }
  .tabs { display: flex; gap: 4px; background: var(--surface2); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border); width: fit-content; margin-bottom: 16px; }
  .tab { padding: 7px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text2); transition: all 0.15s; }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
  .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .activity-dot.create { background: var(--green); }
  .activity-dot.payment { background: var(--cyan); }
  .activity-dot.update { background: var(--accent); }
  .activity-dot.admin { background: var(--red); }
  .mini-chart { height: 100px; display: flex; align-items: flex-end; gap: 4px; }
  .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .chart-bar { width: 100%; border-radius: 3px 3px 0 0; }
  .chart-label { font-size: 9px; color: var(--text3); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 4px; }
  .gap-16 { display: flex; flex-direction: column; gap: 16px; }
  .gap-12 { display: flex; flex-direction: column; gap: 12px; }
  .gap-8 { display: flex; flex-direction: column; gap: 8px; }
  .row { display: flex; align-items: center; gap: 8px; }
  .section-title { font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .section-sub { font-size: 13px; color: var(--text2); margin-bottom: 20px; }
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at 60% 20%, rgba(108,99,255,0.12) 0%, transparent 60%), #0a0a0f; }
  .login-card { width: 420px; background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
  .login-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #f0f0f8; margin: 28px 0 6px; }
  .login-sub { font-size: 13px; color: #9090a8; margin-bottom: 28px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 12px; color: #9090a8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .field input { width: 100%; padding: 12px 14px; background: #1a1a24; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f0f0f8; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
  .field input:focus { border-color: rgba(108,99,255,0.5); }
  .field input::placeholder { color: #5a5a70; }
  .btn-login { width: 100%; padding: 13px; background: #6c63ff; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .btn-login:hover { background: #7c73ff; }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
  .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
  .login-hint { font-size: 12px; color: #5a5a70; text-align: center; margin-top: 20px; }
`;

function LineChart({ data, color = "#6c63ff" }: { data: number[]; color?: string }) {
  const w = 300, h = 80, pad = 8;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const gid = `g${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pts[0]} L${pts.join(" L")} L${pad + (w - pad * 2)},${h} L${pad},${h} Z`} fill={`url(#${gid})`} />
      <path d={`M${pts[0]} L${pts.join(" L")}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {pts.map((pt, i) => <circle key={i} cx={pt.split(",")[0]} cy={pt.split(",")[1]} r="3" fill={color} />)}
    </svg>
  );
}

function BarChart({ data, color }: { data: { l: string; v: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="mini-chart">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-wrap">
          <div className="chart-bar" style={{ height: `${(d.v / max) * 85}px`, background: `linear-gradient(180deg, ${color}, ${color}66)` }} />
          <div className="chart-label">{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// LOGIN
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); }
    catch (err: any) { setError(err.message || "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #6c63ff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FitOS</div>
        <div style={{ fontSize: 11, color: "#5a5a70", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>Trainer Platform</div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to access your dashboard</div>
        {error && <div className="error-box">⚠ {error}</div>}
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email Address</label>
            <input type="email" placeholder="you@yourtrainer.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In →"}</button>
        </form>
        <div className="login-hint">Admin · Trainer · Client — role auto-detected on login</div>
      </div>
    </div>
  );
}

// ADMIN
function AdminDashboard({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [tab, setTab] = useState("overview");
  const revData = [{ l: "Sep", v: 61000 }, { l: "Oct", v: 68000 }, { l: "Nov", v: 72000 }, { l: "Dec", v: 65000 }, { l: "Jan", v: 78000 }, { l: "Feb", v: 84200 }];
  const navItems = [{ id: "overview", icon: "⬛", label: "Dashboard" }, { id: "trainers", icon: "🏋", label: "Trainers" }, { id: "clients", icon: "👥", label: "All Clients" }, { id: "activity", icon: "📋", label: "Activity Logs" }];

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">FitOS</div>
          <div className="logo-sub">Trainer Platform</div>
          <div className="role-badge role-admin">⚡ Super Admin</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">Platform</div>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar avatar-admin">SA</div>
            <div><div className="user-name">{name}</div><div className="user-role">Super Admin</div></div>
          </div>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </div>
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === tab)?.label}</div>
        </div>
        <div className="content">
          {tab === "overview" && (
            <div className="gap-16">
              <div><div className="section-title">Command Center</div><div className="section-sub">Full platform overview — yourtrainer.in</div></div>
              <div className="grid-4">
                {[
                  { label: "Total Revenue", value: "₹84.2K", delta: "+12.4%", up: true, color: "purple" },
                  { label: "Active Clients", value: "147", delta: "+23 this month", up: true, color: "cyan" },
                  { label: "Avg Retention", value: "78%", delta: "-2% MoM", up: false, color: "green" },
                  { label: "Sessions Done", value: "312", delta: "+41 vs last", up: true, color: "orange" },
                ].map((s, i) => (
                  <div key={i} className={`stat-card ${s.color}`}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className={`stat-delta ${s.up ? "delta-up" : "delta-down"}`}>{s.up ? "▲" : "▼"} {s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid-2-3">
                <div className="card">
                  <div className="card-header"><span className="card-title">Monthly Revenue</span><span className="badge badge-green">+12.4%</span></div>
                  <BarChart data={revData} color="#6c63ff" />
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title">Live Activity</span></div>
                  {mockData.activityLogs.map(log => (
                    <div key={log.id} className="activity-item">
                      <div className={`activity-dot ${log.type}`} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{log.actor}</div>
                        <div style={{ fontSize: 12, color: "var(--text2)" }}>{log.action} → <span style={{ color: "var(--accent)" }}>{log.target}</span></div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "trainers" && (
            <div className="gap-16">
              <div><div className="section-title">Trainers</div><div className="section-sub">{mockData.trainers.length} trainers on platform</div></div>
              <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Trainer</th><th>Clients</th><th>Retention</th><th>Revenue</th><th>Sessions</th><th>Status</th></tr></thead>
                    <tbody>
                      {mockData.trainers.map(t => (
                        <tr key={t.id}>
                          <td>
                            <div className="row">
                              <div className="avatar avatar-trainer">{t.avatar}</div>
                              <div>
                                <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                                <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{t.clients}</td>
                          <td>
                            <div className="row">
                              <div className="progress-wrap" style={{ width: 60 }}>
                                <div className={`progress-bar ${t.retention >= 80 ? "pb-green" : "pb-yellow"}`} style={{ width: `${t.retention}%` }} />
                              </div>
                              <span style={{ fontSize: 12 }}>{t.retention}%</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: "var(--cyan)" }}>₹{t.revenue.toLocaleString()}</td>
                          <td>{t.sessions}</td>
                          <td><span className="badge badge-green">{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {tab === "clients" && (
            <div className="gap-16">
              <div><div className="section-title">All Clients</div><div className="section-sub">Across all trainers</div></div>
              <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Client</th><th>Trainer</th><th>Goal</th><th>Weight</th><th>Compliance</th><th>Payment</th></tr></thead>
                    <tbody>
                      {mockData.clients.map(c => (
                        <tr key={c.id}>
                          <td style={{ color: "var(--text)", fontWeight: 600 }}>{c.name}</td>
                          <td>{c.trainer}</td>
                          <td><span className="badge badge-gray">{c.goal}</span></td>
                          <td>{c.weight}kg</td>
                          <td>
                            <div className="row">
                              <div className="progress-wrap" style={{ width: 50 }}>
                                <div className={`progress-bar ${c.compliance >= 85 ? "pb-green" : "pb-yellow"}`} style={{ width: `${c.compliance}%` }} />
                              </div>
                              <span style={{ fontSize: 12 }}>{c.compliance}%</span>
                            </div>
                          </td>
                          <td><span className={`badge ${c.payment === "Active" ? "badge-green" : c.payment === "Expiring" ? "badge-yellow" : "badge-red"}`}>{c.payment}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {tab === "activity" && (
            <div className="gap-16">
              <div><div className="section-title">Activity Logs</div><div className="section-sub">All platform actions</div></div>
              <div className="card">
                {mockData.activityLogs.map(log => (
                  <div key={log.id} className="activity-item">
                    <div className={`activity-dot ${log.type}`} />
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{log.actor}</span>
                        <span style={{ fontSize: 12, color: "var(--text2)" }}> {log.action} → </span>
                        <span style={{ color: "var(--accent)", fontSize: 12 }}>{log.target}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// TRAINER
function TrainerDashboard({ name, email, onLogout }: { name: string; email: string; onLogout: () => void }) {
  const [tab, setTab] = useState("clients");
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
  const navItems = [{ id: "clients", icon: "👥", label: "My Clients" }, { id: "progress", icon: "📈", label: "Progress" }, { id: "payments", icon: "₹", label: "Payments" }];

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">FitOS</div>
          <div className="logo-sub">Trainer Platform</div>
          <div className="role-badge role-trainer">🏋 Trainer</div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">Manage</div>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar avatar-trainer">{initials}</div>
            <div><div className="user-name">{name}</div><div className="user-role">Trainer</div></div>
          </div>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </div>
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === tab)?.label}</div>
        </div>
        <div className="content">
          {tab === "clients" && (
            <div className="gap-16">
              <div><div className="section-title">My Clients</div><div className="section-sub">Logged in as {email}</div></div>
              <div className="grid-4">
                {[
                  { label: "Active Clients", value: "18", color: "cyan" },
                  { label: "Today Sessions", value: "4", color: "purple" },
                  { label: "Avg Compliance", value: "83%", color: "green" },
                  { label: "Revenue Feb", value: "₹12.4K", color: "orange" },
                ].map((s, i) => (
                  <div key={i} className={`stat-card ${s.color}`}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{ fontSize: 26 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="grid-2">
                {mockData.trainerClients.map(c => (
                  <div key={c.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div className="avatar avatar-client">{c.name.split(" ").map((n: string) => n[0]).join("")}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{c.goal}</div>
                        </div>
                      </div>
                      <span className={`badge ${c.payment === "Active" ? "badge-green" : "badge-yellow"}`}>{c.payment}</span>
                    </div>
                    <div className="row">
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>Compliance</span>
                      <div className="progress-wrap" style={{ flex: 1 }}>
                        <div className={`progress-bar ${c.compliance >= 85 ? "pb-green" : "pb-yellow"}`} style={{ width: `${c.compliance}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{c.compliance}%</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10, textAlign: "center" }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: c.delta < 0 ? "var(--green)" : "var(--yellow)" }}>{c.delta > 0 ? "+" : ""}{c.delta}kg</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>Weight Δ</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>{c.sessions}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>Sessions</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{c.nextSession}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>Next</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "progress" && (
            <div className="gap-16">
              <div><div className="section-title">Client Progress</div><div className="section-sub">Weight & strength trends</div></div>
              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><span className="card-title">Weight (kg)</span><span className="badge badge-green">-5.9kg</span></div>
                  <LineChart data={mockData.clientProgress.map(p => p.weight)} color="#6c63ff" />
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title">Strength Score</span><span className="badge badge-purple">+19pts</span></div>
                  <LineChart data={mockData.clientProgress.map(p => p.strength)} color="#22c55e" />
                </div>
              </div>
            </div>
          )}
          {tab === "payments" && (
            <div className="gap-16">
              <div><div className="section-title">Payments</div><div className="section-sub">Client packages and renewals</div></div>
              <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Client</th><th>Package</th><th>Amount</th><th>Expires</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {[
                        { name: "Chris Park", pkg: "3-Month Online", amount: "₹3,600", expires: "Apr 30", status: "Active" },
                        { name: "Luis Gomez", pkg: "Monthly", amount: "₹2,200", expires: "Mar 3", status: "Expiring" },
                        { name: "Felix Ito", pkg: "6-Month Online", amount: "₹6,600", expires: "Jun 30", status: "Active" },
                      ].map((p, i) => (
                        <tr key={i}>
                          <td style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</td>
                          <td>{p.pkg}</td>
                          <td style={{ fontWeight: 600, color: "var(--cyan)" }}>{p.amount}</td>
                          <td>{p.expires}</td>
                          <td><span className={`badge ${p.status === "Active" ? "badge-green" : "badge-yellow"}`}>{p.status}</span></td>
                          <td>{p.status === "Expiring" ? <button className="btn btn-primary btn-sm">Renew</button> : <button className="btn btn-ghost btn-sm">Receipt</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// MAIN AUTH GATE
export default function App() {
  const { user, profile, loading, logout } = useAuth();

  if (loading) return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#a78bfa", fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
        Loading...
      </div>
    </>
  );

  if (!user || !profile) return (
    <>
      <style>{styles}</style>
      <LoginPage />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      {profile.role === "admin" && <AdminDashboard name={profile.name} onLogout={logout} />}
      {profile.role === "trainer" && <TrainerDashboard name={profile.name} email={profile.email} onLogout={logout} />}
      {profile.role === "client" && (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "white", fontFamily: "DM Sans, sans-serif", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Welcome, {profile.name} 👋</div>
          <div style={{ color: "#9090a8" }}>Client dashboard — coming soon</div>
          <button style={{ padding: "8px 20px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }} onClick={logout}>Sign Out</button>
        </div>
      )}
    </>
  );
}
