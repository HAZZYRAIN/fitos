"use client";

import { useState } from "react";

// ============================================================
// MOCK DATA
// ============================================================
const mockData = {
  stats: {
    totalTrainers: 12,
    activeClients: 147,
    monthlyRevenue: 84200,
    avgRetention: 78,
    newClientsThisMonth: 23,
    churnThisMonth: 4,
    sessionsCompleted: 312,
    systemUptime: "99.8%"
  },
  trainers: [
    { id: 1, name: "Alex Rivera", email: "alex@fitpro.com", avatar: "AR", clients: 18, retention: 84, revenue: 12400, sessions: 67, status: "active", plan: "Pro", joined: "2024-01-15" },
    { id: 2, name: "Jordan Smith", email: "jordan@fitpro.com", avatar: "JS", clients: 22, retention: 91, revenue: 16800, sessions: 89, status: "active", plan: "Pro", joined: "2023-11-02" },
    { id: 3, name: "Maya Chen", email: "maya@fitpro.com", avatar: "MC", clients: 14, retention: 71, revenue: 9200, sessions: 51, status: "active", plan: "Starter", joined: "2024-03-08" },
    { id: 4, name: "Kai Thompson", email: "kai@fitpro.com", avatar: "KT", clients: 8, retention: 62, revenue: 5600, sessions: 29, status: "suspended", plan: "Starter", joined: "2024-05-20" },
    { id: 5, name: "Sam Wu", email: "sam@fitpro.com", avatar: "SW", clients: 19, retention: 88, revenue: 14200, sessions: 76, status: "active", plan: "Pro", joined: "2023-09-14" },
  ],
  clients: [
    { id: 1, name: "Chris Park", trainer: "Alex Rivera", trainerId: 1, goal: "Weight Loss", weight: 94, startWeight: 108, target: 82, sessions: 24, compliance: 87, payment: "Active", nextSession: "2026-03-02", joined: "2025-08-10" },
    { id: 2, name: "Emma Davis", trainer: "Jordan Smith", trainerId: 2, goal: "Muscle Gain", weight: 62, startWeight: 58, target: 68, sessions: 31, compliance: 93, payment: "Active", nextSession: "2026-03-01", joined: "2025-06-22" },
    { id: 3, name: "Luis Gomez", trainer: "Alex Rivera", trainerId: 1, goal: "Athletic Performance", weight: 78, startWeight: 80, target: 76, sessions: 18, compliance: 71, payment: "Expiring", nextSession: "2026-03-03", joined: "2025-10-05" },
    { id: 4, name: "Zoe Kim", trainer: "Maya Chen", trainerId: 3, goal: "Weight Loss", weight: 71, startWeight: 84, target: 65, sessions: 42, compliance: 96, payment: "Active", nextSession: "2026-03-01", joined: "2025-04-18" },
    { id: 5, name: "Raj Patel", trainer: "Sam Wu", trainerId: 5, goal: "General Fitness", weight: 83, startWeight: 87, target: 80, sessions: 15, compliance: 68, payment: "Overdue", nextSession: "2026-03-04", joined: "2025-11-30" },
    { id: 6, name: "Priya Shah", trainer: "Jordan Smith", trainerId: 2, goal: "Post-Injury Rehab", weight: 59, startWeight: 61, target: 57, sessions: 28, compliance: 89, payment: "Active", nextSession: "2026-03-02", joined: "2025-07-14" },
  ],
  activityLogs: [
    { id: 1, actor: "Jordan Smith", action: "Created workout plan", target: "Emma Davis", time: "2 min ago", type: "create" },
    { id: 2, actor: "Alex Rivera", action: "Logged payment received", target: "Chris Park", time: "18 min ago", type: "payment" },
    { id: 3, actor: "Maya Chen", action: "Updated body measurements", target: "Zoe Kim", time: "34 min ago", type: "update" },
    { id: 4, actor: "Client: Raj Patel", action: "Logged workout", target: "Workout #47", time: "1 hr ago", type: "log" },
    { id: 5, actor: "Super Admin", action: "Suspended trainer account", target: "Kai Thompson", time: "2 hr ago", type: "admin" },
    { id: 6, actor: "Sam Wu", action: "Sent renewal reminder", target: "Luis Gomez", time: "3 hr ago", type: "message" },
    { id: 7, actor: "Client: Emma Davis", action: "Uploaded progress photo", target: "Week 14", time: "4 hr ago", type: "upload" },
    { id: 8, actor: "Jordan Smith", action: "Completed session", target: "Priya Shah", time: "5 hr ago", type: "session" },
  ],
  trainerClients: {
    1: [
      { id: 1, name: "Chris Park", goal: "Weight Loss", compliance: 87, nextSession: "Mon 9am", payment: "Active", weight: 94, delta: -14, sessions: 24 },
      { id: 3, name: "Luis Gomez", goal: "Athletic Perf.", compliance: 71, nextSession: "Tue 7am", payment: "Expiring", weight: 78, delta: -2, sessions: 18 },
      { id: 7, name: "Dana White", goal: "Muscle Gain", compliance: 82, nextSession: "Wed 6am", payment: "Active", weight: 71, delta: 3, sessions: 11 },
      { id: 8, name: "Felix Ito", goal: "Weight Loss", compliance: 91, nextSession: "Thu 8am", payment: "Active", weight: 88, delta: -8, sessions: 29 },
    ]
  },
  workoutPlans: [
    { id: 1, name: "Fat Burn Protocol A", client: "Chris Park", type: "Cardio + Strength", days: "Mon/Wed/Fri", duration: "55 min", weeks: 8, progress: 62 },
    { id: 2, name: "Hypertrophy Block 2", client: "Dana White", type: "Strength", days: "Mon/Tue/Thu/Sat", duration: "70 min", weeks: 12, progress: 25 },
    { id: 3, name: "Athletic Conditioning", client: "Luis Gomez", type: "Performance", days: "Tue/Thu/Sat", duration: "60 min", weeks: 6, progress: 83 },
  ],
  clientProgress: [
    { week: "W1", weight: 94, bf: 28, strength: 60 },
    { week: "W2", weight: 93.2, bf: 27.8, strength: 63 },
    { week: "W3", weight: 92.1, bf: 27.2, strength: 65 },
    { week: "W4", weight: 91.4, bf: 26.9, strength: 68 },
    { week: "W5", weight: 90.8, bf: 26.3, strength: 71 },
    { week: "W6", weight: 89.5, bf: 25.8, strength: 74 },
    { week: "W7", weight: 88.9, bf: 25.2, strength: 76 },
    { week: "W8", weight: 88.1, bf: 24.7, strength: 79 },
  ]
};

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24; --surface3: #22222f;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
    --text: #f0f0f8; --text2: #9090a8; --text3: #5a5a70;
    --accent: #6c63ff; --accent2: #ff6b6b; --green: #22c55e;
    --yellow: #f59e0b; --red: #ef4444; --cyan: #06b6d4;
    --font-display: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif;
    --radius: 12px; --radius-sm: 8px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 240px; min-width: 240px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
  .sidebar-logo { padding: 24px 20px 20px; border-bottom: 1px solid var(--border); }
  .logo-mark { font-family: var(--font-display); font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #6c63ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo-sub { font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .role-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
  .role-admin { background: rgba(108,99,255,0.2); color: #a78bfa; border: 1px solid rgba(108,99,255,0.3); }
  .role-trainer { background: rgba(6,182,212,0.2); color: #67e8f9; border: 1px solid rgba(6,182,212,0.3); }
  .role-client { background: rgba(34,197,94,0.2); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
  .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nav-section { padding: 8px 12px 4px; font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; cursor: pointer; border-radius: var(--radius-sm); margin: 1px 8px; font-size: 13.5px; color: var(--text2); transition: all 0.15s; font-weight: 500; border: 1px solid transparent; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: rgba(108,99,255,0.15); color: #a78bfa; border-color: rgba(108,99,255,0.25); }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge { margin-left: auto; background: var(--accent); color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
  .sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
  .user-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface2); border-radius: var(--radius-sm); border: 1px solid var(--border); cursor: pointer; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: var(--font-display); flex-shrink: 0; }
  .avatar-admin { background: linear-gradient(135deg, #6c63ff, #a78bfa); color: white; }
  .avatar-trainer { background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; }
  .avatar-client { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
  .user-name { font-size: 13px; font-weight: 600; }
  .user-role { font-size: 11px; color: var(--text3); }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 60px; min-height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 16px; }
  .topbar-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; flex: 1; }
  .topbar-search { display: flex; align-items: center; gap: 8px; background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 7px 14px; color: var(--text2); font-size: 13px; width: 220px; cursor: pointer; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all 0.15s; border: none; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #7c73ff; }
  .btn-ghost { background: var(--surface2); color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--surface3); color: var(--text); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .btn-success { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
  .content { flex: 1; overflow-y: auto; padding: 24px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .grid-2-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card.purple::before { background: linear-gradient(90deg, #6c63ff, #a78bfa); }
  .stat-card.cyan::before { background: linear-gradient(90deg, #06b6d4, #0ea5e9); }
  .stat-card.green::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
  .stat-card.orange::before { background: linear-gradient(90deg, #f59e0b, #ef4444); }
  .stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 8px; }
  .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 800; line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--text3); margin-top: 6px; }
  .stat-delta { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; margin-top: 4px; }
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
  .progress-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
  .pb-green { background: linear-gradient(90deg, #22c55e, #16a34a); }
  .pb-yellow { background: linear-gradient(90deg, #f59e0b, #d97706); }
  .pb-red { background: linear-gradient(90deg, #ef4444, #dc2626); }
  .pb-purple { background: linear-gradient(90deg, #6c63ff, #a78bfa); }
  .mini-chart { height: 120px; display: flex; align-items: flex-end; gap: 4px; padding: 8px 0 0; }
  .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .chart-bar { width: 100%; border-radius: 3px 3px 0 0; transition: all 0.3s; cursor: pointer; }
  .chart-label { font-size: 9px; color: var(--text3); }
  .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .activity-dot.create { background: var(--green); }
  .activity-dot.payment { background: var(--cyan); }
  .activity-dot.update { background: var(--accent); }
  .activity-dot.log { background: var(--yellow); }
  .activity-dot.admin { background: var(--red); }
  .activity-dot.message { background: #ec4899; }
  .activity-dot.session { background: #a78bfa; }
  .activity-dot.upload { background: #fb923c; }
  .tabs { display: flex; gap: 4px; background: var(--surface2); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border); }
  .tab { padding: 7px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text2); transition: all 0.15s; white-space: nowrap; }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
  .client-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; cursor: pointer; transition: all 0.15s; }
  .client-card:hover { border-color: rgba(108,99,255,0.3); }
  .client-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .client-info { display: flex; align-items: center; gap: 10px; }
  .client-name { font-size: 14px; font-weight: 600; }
  .client-goal { font-size: 11px; color: var(--text3); }
  .client-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
  .cs-item { text-align: center; }
  .cs-val { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
  .cs-key { font-size: 10px; color: var(--text3); }
  .section-header { margin-bottom: 20px; }
  .section-title { font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .section-sub { font-size: 13px; color: var(--text2); }
  .role-switcher { display: flex; gap: 8px; padding: 12px 16px; background: var(--surface2); border-bottom: 1px solid var(--border); align-items: center; }
  .rs-btn { padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid transparent; transition: all 0.15s; font-family: var(--font-body); }
  .rs-admin { border-color: rgba(108,99,255,0.3); color: var(--text3); background: transparent; }
  .rs-admin.active { background: rgba(108,99,255,0.2); color: #a78bfa; border-color: rgba(108,99,255,0.5); }
  .rs-trainer { border-color: rgba(6,182,212,0.3); color: var(--text3); background: transparent; }
  .rs-trainer.active { background: rgba(6,182,212,0.2); color: #67e8f9; border-color: rgba(6,182,212,0.5); }
  .rs-client { border-color: rgba(34,197,94,0.3); color: var(--text3); background: transparent; }
  .rs-client.active { background: rgba(34,197,94,0.2); color: #86efac; border-color: rgba(34,197,94,0.5); }
  .plan-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; }
  .plan-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .plan-meta { font-size: 11px; color: var(--text3); margin-bottom: 10px; }
  .metric-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .metric-row:last-child { border-bottom: none; }
  .metric-label { font-size: 13px; color: var(--text2); }
  .metric-value { font-size: 13px; font-weight: 600; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 4px; }
  .gap-8 { display: flex; flex-direction: column; gap: 8px; }
  .gap-12 { display: flex; flex-direction: column; gap: 12px; }
  .gap-16 { display: flex; flex-direction: column; gap: 16px; }
  .gap-20 { display: flex; flex-direction: column; gap: 20px; }
  .row { display: flex; align-items: center; gap: 8px; }
  .ml-auto { margin-left: auto; }
  .text-sm { font-size: 12px; color: var(--text2); }
  .text-xs { font-size: 11px; color: var(--text3); }
  .mt-4 { margin-top: 4px; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .mb-16 { margin-bottom: 16px; }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-accent { color: var(--accent); }
`;

// ============================================================
// MINI CHARTS
// ============================================================
function LineChart({ data, color = "#6c63ff" }: { data: number[]; color?: string }) {
  const w = 300, h = 80, pad = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `M${pts[0]} L${pts.join(" L")} L${pad + (w - pad * 2)},${h} L${pad},${h} Z`;
  const line = `M${pts[0]} L${pts.join(" L")}`;
  const gradId = `grad${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",");
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

function BarChart({ data, color = "#6c63ff" }: { data: { l: string; v: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="mini-chart">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-wrap">
          <div className="chart-bar" style={{ height: `${(d.v / max) * 90}px`, background: `linear-gradient(180deg, ${color}, ${color}88)` }} />
          <div className="chart-label">{d.l}</div>
        </div>
      ))}
    </div>
  );
}

function DonutMetric({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 30; const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
          strokeLinecap="round" transform="rotate(-90 40 40)" />
        <text x="40" y="44" textAnchor="middle" fill="white" fontSize="14" fontFamily="'Syne',sans-serif" fontWeight="700">{value}%</text>
      </svg>
      <span style={{ fontSize: 11, color: "var(--text3)" }}>{label}</span>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const revData = [
    { l: "Sep", v: 61000 }, { l: "Oct", v: 68000 }, { l: "Nov", v: 72000 },
    { l: "Dec", v: 65000 }, { l: "Jan", v: 78000 }, { l: "Feb", v: 84200 }
  ];
  const clientGrowth = [
    { l: "Sep", v: 112 }, { l: "Oct", v: 118 }, { l: "Nov", v: 129 },
    { l: "Dec", v: 135 }, { l: "Jan", v: 141 }, { l: "Feb", v: 147 }
  ];

  return (
    <div className="gap-20">
      <div className="section-header">
        <div className="section-title">Command Center</div>
        <div className="section-sub">Full system overview — real-time platform intelligence</div>
      </div>
      <div className="tabs" style={{ width: "fit-content" }}>
        {["overview", "trainers", "clients", "activity"].map(t => (
          <div key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="gap-16">
          <div className="grid-4">
            {[
              { label: "Total Revenue", value: "₹84.2K", sub: "Feb 2026", delta: "+12.4%", up: true, color: "purple" },
              { label: "Active Clients", value: "147", sub: "Across all trainers", delta: "+23 this month", up: true, color: "cyan" },
              { label: "Avg Retention", value: "78%", sub: "Rolling 90 days", delta: "-2% MoM", up: false, color: "green" },
              { label: "Sessions Done", value: "312", sub: "This month", delta: "+41 vs last", up: true, color: "orange" },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.color}`}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
                <div className={`stat-delta ${s.up ? "delta-up" : "delta-down"}`}>{s.up ? "▲" : "▼"} {s.delta}</div>
              </div>
            ))}
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">Monthly Revenue</span><span className="badge badge-green">+12.4%</span></div>
              <BarChart data={revData} color="#6c63ff" />
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Client Growth</span><span className="badge badge-green">Active</span></div>
              <BarChart data={clientGrowth} color="#06b6d4" />
            </div>
          </div>
          <div className="grid-2-3">
            <div className="card">
              <div className="card-header"><span className="card-title">Health Metrics</span></div>
              <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0" }}>
                <DonutMetric value={78} color="#22c55e" label="Retention" />
                <DonutMetric value={84} color="#6c63ff" label="Compliance" />
                <DonutMetric value={91} color="#06b6d4" label="Satisfaction" />
              </div>
              <div style={{ marginTop: 16 }}>
                {[
                  { label: "Active Trainers", value: "11 / 12" },
                  { label: "Expiring Packages", value: "8 clients" },
                  { label: "Overdue Payments", value: "3 clients" },
                  { label: "Avg Clients/Trainer", value: "13.4" },
                ].map((m, i) => (
                  <div key={i} className="metric-row">
                    <span className="metric-label">{m.label}</span>
                    <span className="metric-value">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Live Activity Log</span></div>
              {mockData.activityLogs.map(log => (
                <div key={log.id} className="activity-item">
                  <div className={`activity-dot ${log.type}`} />
                  <div style={{ flex: 1 }}>
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

      {activeTab === "trainers" && (
        <div className="gap-16">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary btn-sm">+ Add Trainer</button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trainer</th><th>Plan</th><th>Clients</th><th>Retention</th><th>Revenue</th><th>Sessions</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.trainers.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar avatar-trainer" style={{ fontSize: 11 }}>{t.avatar}</div>
                          <div>
                            <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${t.plan === "Pro" ? "badge-purple" : "badge-gray"}`}>{t.plan}</span></td>
                      <td style={{ fontWeight: 600 }}>{t.clients}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-wrap" style={{ width: 60 }}>
                            <div className={`progress-bar ${t.retention >= 80 ? "pb-green" : "pb-yellow"}`} style={{ width: `${t.retention}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{t.retention}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{t.revenue.toLocaleString()}</td>
                      <td>{t.sessions}</td>
                      <td><span className={`badge ${t.status === "active" ? "badge-green" : "badge-red"}`}>{t.status}</span></td>
                      <td>
                        <div className="row">
                          <button className="btn btn-ghost btn-sm">Edit</button>
                          <button className={`btn btn-sm ${t.status === "active" ? "btn-danger" : "btn-success"}`}>
                            {t.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "clients" && (
        <div className="gap-16">
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
            <button className="btn btn-primary btn-sm">+ Add Client</button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th><th>Trainer</th><th>Goal</th><th>Weight</th><th>Compliance</th><th>Sessions</th><th>Payment</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.clients.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar avatar-client" style={{ fontSize: 11 }}>{c.name.split(" ").map((n: string) => n[0]).join("")}</div>
                          <span style={{ color: "var(--text)", fontWeight: 600 }}>{c.name}</span>
                        </div>
                      </td>
                      <td>{c.trainer}</td>
                      <td><span className="badge badge-gray">{c.goal}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.weight}kg</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="progress-wrap" style={{ width: 50 }}>
                            <div className={`progress-bar ${c.compliance >= 85 ? "pb-green" : "pb-yellow"}`} style={{ width: `${c.compliance}%` }} />
                          </div>
                          <span style={{ fontSize: 12 }}>{c.compliance}%</span>
                        </div>
                      </td>
                      <td>{c.sessions}</td>
                      <td><span className={`badge ${c.payment === "Active" ? "badge-green" : c.payment === "Expiring" ? "badge-yellow" : "badge-red"}`}>{c.payment}</span></td>
                      <td><button className="btn btn-ghost btn-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="card">
          <div className="card-header"><span className="card-title">Full Audit Trail</span><button className="btn btn-ghost btn-sm">Export</button></div>
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
      )}
    </div>
  );
}

// ============================================================
// TRAINER DASHBOARD
// ============================================================
function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState("clients");
  const clients = mockData.trainerClients[1];

  return (
    <div className="gap-20">
      <div className="section-header">
        <div className="section-title">Trainer Hub</div>
        <div className="section-sub">Alex Rivera · 18 active clients · Next session in 2h</div>
      </div>
      <div className="grid-4">
        {[
          { label: "Active Clients", value: "18", delta: "+3 this month", up: true, color: "cyan" },
          { label: "Today's Sessions", value: "4", delta: "2 completed", up: true, color: "purple" },
          { label: "Avg Compliance", value: "83%", delta: "-2% WoW", up: false, color: "green" },
          { label: "Revenue (Feb)", value: "₹12.4K", delta: "+8.2%", up: true, color: "orange" },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 26 }}>{s.value}</div>
            <div className={`stat-delta ${s.up ? "delta-up" : "delta-down"}`}>{s.up ? "▲" : "▼"} {s.delta}</div>
          </div>
        ))}
      </div>
      <div className="tabs" style={{ width: "fit-content" }}>
        {["clients", "plans", "progress", "payments"].map(t => (
          <div key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === "clients" && (
        <div className="gap-12">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary btn-sm">+ New Client</button>
          </div>
          <div className="grid-2">
            {clients.map((c: any) => (
              <div key={c.id} className="client-card">
                <div className="client-top">
                  <div className="client-info">
                    <div className="avatar avatar-client">{c.name.split(" ").map((n: string) => n[0]).join("")}</div>
                    <div>
                      <div className="client-name">{c.name}</div>
                      <div className="client-goal">{c.goal}</div>
                    </div>
                  </div>
                  <span className={`badge ${c.payment === "Active" ? "badge-green" : "badge-yellow"}`}>{c.payment}</span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>Compliance</span>
                  <div className="progress-wrap" style={{ flex: 1 }}>
                    <div className={`progress-bar ${c.compliance >= 85 ? "pb-green" : "pb-yellow"}`} style={{ width: `${c.compliance}%` }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.compliance}%</span>
                </div>
                <div className="client-stats">
                  <div className="cs-item">
                    <div className="cs-val" style={{ color: c.delta < 0 ? "var(--green)" : "var(--yellow)" }}>{c.delta > 0 ? "+" : ""}{c.delta}kg</div>
                    <div className="cs-key">Weight Δ</div>
                  </div>
                  <div className="cs-item">
                    <div className="cs-val">{c.sessions}</div>
                    <div className="cs-key">Sessions</div>
                  </div>
                  <div className="cs-item">
                    <div className="cs-val" style={{ fontSize: 12 }}>{c.nextSession}</div>
                    <div className="cs-key">Next Session</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">⚠ Alerts</span></div>
            {[
              { text: "Luis Gomez — Package expiring in 3 days", color: "var(--yellow)" },
              { text: "Felix Ito — No workout logged in 4 days", color: "var(--red)" },
              { text: "Dana White — Measurement update due", color: "var(--accent)" },
            ].map((a, i) => (
              <div key={i} className="row" style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{a.text}</span>
                <button className="btn btn-ghost btn-sm ml-auto">Resolve</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div className="gap-12">
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn btn-ghost btn-sm">+ Diet Plan</button>
            <button className="btn btn-primary btn-sm">+ Workout Plan</button>
          </div>
          {mockData.workoutPlans.map(p => (
            <div key={p.id} className="plan-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-meta">{p.client} · {p.type} · {p.days} · {p.duration}</div>
                </div>
                <span className="badge badge-gray">{p.weeks}w</span>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <div className="progress-wrap" style={{ flex: 1 }}>
                  <div className="progress-bar pb-purple" style={{ width: `${p.progress}%` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, width: 35, textAlign: "right" }}>{p.progress}%</span>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm">Edit</button>
                <button className="btn btn-ghost btn-sm">View Exercises</button>
                <button className="btn btn-ghost btn-sm">Clone</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "progress" && (
        <div className="gap-16">
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
          <div className="grid-3">
            {[
              { label: "Chest", now: "99cm", delta: "-3cm" }, { label: "Waist", now: "90cm", delta: "-6cm" },
              { label: "Hips", now: "104cm", delta: "-4cm" }, { label: "Arms", now: "36cm", delta: "+2cm" },
              { label: "Thighs", now: "58cm", delta: "-4cm" }, { label: "Body Fat", now: "24.7%", delta: "-3.3%" },
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 14 }}>
                <div className="stat-label">{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>{m.now}</div>
                <div style={{ fontSize: 12, color: m.delta.startsWith("-") ? "var(--green)" : "var(--yellow)", marginTop: 4 }}>{m.delta}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Client</th><th>Package</th><th>Amount</th><th>Expires</th><th>Status</th><th>Action</th></tr>
              </thead>
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
      )}
    </div>
  );
}

// ============================================================
// CLIENT DASHBOARD
// ============================================================
function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("today");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const workout = [
    { id: "1", name: "Barbell Squat", sets: "4 × 10", weight: "80kg" },
    { id: "2", name: "Romanian Deadlift", sets: "3 × 12", weight: "60kg" },
    { id: "3", name: "Leg Press", sets: "3 × 15", weight: "120kg" },
    { id: "4", name: "Walking Lunges", sets: "3 × 20", weight: "BW" },
    { id: "5", name: "Calf Raises", sets: "4 × 20", weight: "40kg" },
  ];
  const diet = [
    { id: "d1", meal: "Breakfast", food: "Oats + 4 egg whites + banana", cal: 420, done: true },
    { id: "d2", meal: "Mid-Morning", food: "Greek yogurt + almonds", cal: 200, done: true },
    { id: "d3", meal: "Lunch", food: "Rice + chicken breast + veggies", cal: 560, done: false },
    { id: "d4", meal: "Pre-Workout", food: "Apple + black coffee", cal: 80, done: false },
    { id: "d5", meal: "Dinner", food: "Paneer + roti + salad", cal: 490, done: false },
  ];
  const doneCount = workout.filter(w => checked[w.id]).length;

  return (
    <div className="gap-20">
      <div className="section-header">
        <div className="section-title">Good morning, Chris 👋</div>
        <div className="section-sub">Week 9 of 16 · Fat Loss Protocol · Trainer: Alex Rivera</div>
      </div>
      <div className="grid-4">
        {[
          { label: "Today's Steps", value: "6,240", target: "10,000", pct: 62, color: "#6c63ff" },
          { label: "Water Intake", value: "1.8L", target: "3L", pct: 60, color: "#06b6d4" },
          { label: "Calories", value: "980", target: "1,750", pct: 56, color: "#f59e0b" },
          { label: "Sleep", value: "7.1h", target: "8h", pct: 89, color: "#22c55e" },
        ].map((v, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `2px solid ${v.color}` }}>
            <div className="stat-label">{v.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)", color: v.color }}>{v.value}</div>
            <div style={{ marginTop: 8 }}>
              <div className="progress-wrap">
                <div className="progress-bar" style={{ width: `${v.pct}%`, background: `linear-gradient(90deg, ${v.color}, ${v.color}88)` }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Target: {v.target}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="tabs" style={{ width: "fit-content" }}>
        {["today", "diet", "progress", "chat"].map(t => (
          <div key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "today" ? "🏋 Workout" : t === "diet" ? "🥗 Diet" : t === "progress" ? "📈 Progress" : "💬 Chat"}
          </div>
        ))}
      </div>

      {activeTab === "today" && (
        <div className="gap-16">
          <div className="row">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Leg Day — Lower Body Strength</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Session #24 · Est. 55 min</div>
            </div>
            <button className="btn btn-primary ml-auto">Log All Complete</button>
          </div>
          <div className="gap-8">
            {workout.map(ex => (
              <div key={ex.id} onClick={() => toggle(ex.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
                background: checked[ex.id] ? "rgba(34,197,94,0.08)" : "var(--surface)",
                border: `1px solid ${checked[ex.id] ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.2s"
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${checked[ex.id] ? "var(--green)" : "var(--border2)"}`,
                  background: checked[ex.id] ? "var(--green)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "white", flexShrink: 0
                }}>{checked[ex.id] ? "✓" : ""}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: checked[ex.id] ? "var(--green)" : "var(--text)" }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{ex.sets} · {ex.weight}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="row">
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{doneCount} / {workout.length} completed</span>
            <div className="progress-wrap" style={{ flex: 1 }}>
              <div className="progress-bar pb-purple" style={{ width: `${(doneCount / workout.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "diet" && (
        <div className="gap-8">
          {diet.map(item => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              background: (checked[item.id] || item.done) ? "rgba(34,197,94,0.06)" : "var(--surface)",
              border: `1px solid ${(checked[item.id] || item.done) ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)", cursor: "pointer"
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `2px solid ${(checked[item.id] || item.done) ? "var(--green)" : "var(--border2)"}`,
                background: (checked[item.id] || item.done) ? "var(--green)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "white", flexShrink: 0
              }}>{(checked[item.id] || item.done) ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{item.meal}</div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{item.food}</div>
              </div>
              <span className="badge badge-gray">{item.cal} kcal</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "progress" && (
        <div className="gap-16">
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">Weight Trend</span></div>
              <LineChart data={mockData.clientProgress.map(p => p.weight)} color="#6c63ff" />
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Strength Score</span></div>
              <LineChart data={mockData.clientProgress.map(p => p.strength)} color="#22c55e" />
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Progress Photos</span><button className="btn btn-primary btn-sm">+ Upload</button></div>
            <div style={{ display: "flex", gap: 12 }}>
              {["Week 1", "Week 4", "Week 8"].map((w, i) => (
                <div key={i} style={{ flex: 1, aspectRatio: "3/4", background: "var(--surface2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ fontSize: 32 }}>📸</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{w}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>Alex Rivera · Trainer</div>
          <div className="gap-8" style={{ maxHeight: 300, overflowY: "auto" }}>
            {[
              { from: "trainer", text: "Great job on Sunday's session Chris! Legs looked strong.", time: "Sun 6:42pm" },
              { from: "client", text: "Thanks Coach! Felt good. A bit sore today though 😅", time: "Sun 7:10pm" },
              { from: "trainer", text: "Normal for week 9. Hit 160g protein today minimum.", time: "Sun 7:14pm" },
              { from: "client", text: "Can I swap Tuesday's session to Thursday?", time: "Mon 8:30am" },
              { from: "trainer", text: "Yes, Thursday 7am works. Calendar updated.", time: "Mon 9:02am" },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "client" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "72%", padding: "10px 14px",
                  background: m.from === "client" ? "rgba(108,99,255,0.2)" : "var(--surface2)",
                  borderRadius: m.from === "client" ? "12px 12px 0 12px" : "12px 12px 12px 0",
                  border: `1px solid ${m.from === "client" ? "rgba(108,99,255,0.3)" : "var(--border)"}`,
                }}>
                  <div style={{ fontSize: 13 }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
            <input placeholder="Message your trainer..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-body)" }} />
            <button className="btn btn-primary btn-sm">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
const NAV_CONFIG: Record<string, { section: string; items: { id: string; icon: string; label: string; badge?: number }[] }[]> = {
  admin: [
    { section: "Platform", items: [
      { id: "dashboard", icon: "⬛", label: "Dashboard" },
      { id: "trainers", icon: "🏋", label: "Trainers", badge: 12 },
      { id: "clients", icon: "👥", label: "All Clients" },
    ]},
    { section: "Analytics", items: [
      { id: "revenue", icon: "₹", label: "Revenue" },
      { id: "activity", icon: "📋", label: "Activity Logs" },
    ]},
    { section: "System", items: [
      { id: "settings", icon: "⚙", label: "Settings" },
    ]},
  ],
  trainer: [
    { section: "Manage", items: [
      { id: "clients", icon: "👥", label: "My Clients" },
      { id: "plans", icon: "📋", label: "Plans & Diets" },
    ]},
    { section: "Track", items: [
      { id: "progress", icon: "📈", label: "Progress" },
      { id: "payments", icon: "₹", label: "Payments" },
      { id: "messages", icon: "💬", label: "Messages", badge: 3 },
    ]},
  ],
  client: [
    { section: "Daily", items: [
      { id: "today", icon: "🏋", label: "Today's Plan" },
      { id: "diet", icon: "🥗", label: "Diet Checklist" },
    ]},
    { section: "Track", items: [
      { id: "progress", icon: "📈", label: "Progress" },
      { id: "chat", icon: "💬", label: "Trainer Chat" },
    ]},
  ],
};

const userInfo: Record<string, { name: string; role: string; avatarClass: string; initials: string; badgeClass: string }> = {
  admin: { name: "Super Admin", role: "Platform Owner", avatarClass: "avatar-admin", initials: "SA", badgeClass: "role-admin" },
  trainer: { name: "Alex Rivera", role: "Personal Trainer", avatarClass: "avatar-trainer", initials: "AR", badgeClass: "role-trainer" },
  client: { name: "Chris Park", role: "Client", avatarClass: "avatar-client", initials: "CP", badgeClass: "role-client" },
};

const defaultPage: Record<string, string> = { admin: "dashboard", trainer: "clients", client: "today" };

export default function App() {
  const [role, setRole] = useState("admin");
  const [activePage, setActivePage] = useState("dashboard");
  const user = userInfo[role];

  const switchRole = (r: string) => { setRole(r); setActivePage(defaultPage[r]); };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">FitOS</div>
            <div className="logo-sub">Trainer Platform</div>
            <div className={`role-badge ${user.badgeClass}`}>
              {role === "admin" ? "⚡ Super Admin" : role === "trainer" ? "🏋 Trainer" : "👤 Client"}
            </div>
          </div>
          <div className="sidebar-nav">
            {NAV_CONFIG[role].map(section => (
              <div key={section.section}>
                <div className="nav-section">{section.section}</div>
                {section.items.map(item => (
                  <div key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setActivePage(item.id)}>
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className={`avatar ${user.avatarClass}`}>{user.initials}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="main">
          <div className="role-switcher">
            <span style={{ fontSize: 11, color: "var(--text3)", marginRight: 4 }}>VIEW AS:</span>
            {["admin", "trainer", "client"].map(r => (
              <button key={r} className={`rs-btn rs-${r} ${role === r ? "active" : ""}`} onClick={() => switchRole(r)}>
                {r === "admin" ? "⚡ Admin" : r === "trainer" ? "🏋 Trainer" : "👤 Client"}
              </button>
            ))}
          </div>
          <div className="topbar">
            <div className="topbar-title">
              {role === "admin" ? "Admin Dashboard" : role === "trainer" ? "Trainer Hub" : "Client Dashboard"}
            </div>
            <div className="topbar-search">🔍 <span>Search...</span></div>
            <button className="btn btn-ghost btn-sm">🔔</button>
          </div>
          <div className="content">
            {role === "admin" && <AdminDashboard />}
            {role === "trainer" && <TrainerDashboard />}
            {role === "client" && <ClientDashboard />}
          </div>
        </div>
      </div>
    </>
  );
}
