"use client";
// ============================================================
// YOURTRAINER — LOGIN COMPONENT
// Firebase email/password auth.
// Role is auto-detected from Firestore profile after login.
// ============================================================
import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, pass);
    } catch (ex: any) {
      setErr(ex.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lw">
      <div className="lc">
        <div className="logo-yt">
          Your<span>Trainer</span>
        </div>
        <div className="logo-tag" style={{ marginTop: 4 }}>
          India's Trainer Platform
        </div>
        <div className="lt">Sign in</div>
        <div className="ls">Role detected automatically on login</div>

        {err && <div className="lerr">⚠ {err}</div>}

        <form onSubmit={handleSubmit}>
          <label className="lb">Email</label>
          <input
            className="li"
            type="email"
            placeholder="you@yourtrainer.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <label className="lb">Password</label>
          <input
            className="li"
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          <button className="lbtn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div
          style={{
            fontSize: 11,
            color: "var(--t4)",
            textAlign: "center",
            marginTop: 18,
          }}
        >
          Admin · Trainer · Client — one login
        </div>
      </div>
    </div>
  );
}
