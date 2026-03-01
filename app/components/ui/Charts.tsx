"use client";
// ============================================================
// YOURTRAINER — CHART COMPONENTS
// Pure display components — no state, no Firestore.
// Pass data as props, they render. That's it.
// ============================================================

// ── LINE CHART ──────────────────────────────────────────────
export function LineChart({
  data,
  color = "#ff4d00",
}: {
  data: number[];
  color?: string;
}) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{
          height: 85,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--t3)",
          fontSize: 11,
        }}
      >
        Not enough data
      </div>
    );
  }
  const w = 340, h = 85, pad = 10;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const gid = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M${pts[0]} L${pts.join(" L")} L${pad + (w - pad * 2)},${h} L${pad},${h} Z`}
        fill={`url(#${gid})`}
      />
      <path
        d={`M${pts[0]} L${pts.join(" L")}`}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((pt, i) => (
        <circle
          key={i}
          cx={pt.split(",")[0]}
          cy={pt.split(",")[1]}
          r="4"
          fill={color}
          stroke="var(--s1)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

// ── BAR CHART ───────────────────────────────────────────────
export function BarChart({
  data,
  color,
}: {
  data: { l: string; v: number }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="bc">
      {data.map((d, i) => (
        <div key={i} className="bw">
          <div
            className="bb2"
            style={{
              height: `${(d.v / max) * 85}px`,
              background: `linear-gradient(180deg,${color},${color}44)`,
            }}
            title={`${d.l}: ${d.v}`}
          />
          <div className="bl">{d.l}</div>
        </div>
      ))}
    </div>
  );
}

// ── SCORE RING ──────────────────────────────────────────────
export function ScoreRing({
  score,
  size = 70,
}: {
  score: number;
  size?: number;
}) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const color =
    score >= 85 ? "#00d084" : score >= 70 ? "#ffb020" : "#ff4466";
  return (
    <div className="score-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={size * 0.1}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.1}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.22}
          fontFamily="'Outfit',sans-serif"
          fontWeight="800"
        >
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 10, color: "var(--t3)" }}>Score</span>
    </div>
  );
}

// ── DONUT ───────────────────────────────────────────────────
export function Donut({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
      }}
    >
      <svg width={76} height={76} viewBox="0 0 76 76">
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
        <text
          x="38"
          y="43"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontFamily="'Outfit',sans-serif"
          fontWeight="800"
        >
          {value}%
        </text>
      </svg>
      <span style={{ fontSize: 10, color: "var(--t3)" }}>{label}</span>
    </div>
  );
}
