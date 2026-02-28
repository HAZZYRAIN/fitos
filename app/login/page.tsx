
"use client";

import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // TEMP safe call – adjust later if backend auth is added
      await login({ email });
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'DM Sans', sans-serif; }

        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(ellipse at 60% 20%, rgba(108,99,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.08) 0%, transparent 50%),
            #0a0a0f;
        }

        .login-card {
          width: 420px;
          background: #111118;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-sub {
          font-size: 12px;
          color: #5a5a70;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 28px 0 6px;
        }

        .login-sub {
          font-size: 13px;
          color: #9090a8;
          margin-bottom: 28px;
        }

        .field { margin-bottom: 16px; }

        .field label {
          display: block;
          font-size: 12px;
          color: #9090a8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .field input {
          width: 100%;
          padding: 12px 14px;
          background: #1a1a24;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #f0f0f8;
          font-size: 14px;
          outline: none;
        }

        .field input:focus {
          border-color: rgba(108,99,255,0.5);
        }

        .btn-login {
          width: 100%;
          padding: 13px;
          background: #6c63ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 16px;
        }

        .divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 24px 0;
        }

        .hint {
          font-size: 12px;
          color: #5a5a70;
          text-align: center;
        }

        .hint span {
          color: #a78bfa;
        }
      `}</style>

      <div className="login-wrap">
        <div className="login-card">
          <div className="logo">FitOS</div>
          <div className="logo-sub">Trainer Platform</div>

          <div className="login-title">Welcome back</div>
          <div className="login-sub">Sign in to your account to continue</div>

          {error && <div className="error-box">⚠ {error}</div>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn-login" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <hr className="divider" />

          <div className="hint">
            Admin · Trainer · Client — same login, role auto-detected
            <br />
            <span>Forgot password?</span> Contact your admin
          </div>
        </div>
      </div>
    </>
  );
}
