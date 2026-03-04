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
      await login(email, password);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #faf8f4;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border: 1px solid #ede8de;
          border-radius: 16px;
          padding: 40px 36px;
          box-shadow: 0 4px 24px rgba(180,150,80,0.08), 0 1px 4px rgba(0,0,0,0.06);
          margin: 16px;
        }

        .login-logo {
          font-size: 22px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: -0.5px;
          margin-bottom: 2px;
        }

        .login-logo span {
          color: #c9a84c;
        }

        .login-tagline {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 28px;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .login-sub {
          font-size: 13px;
          color: #888;
          margin-bottom: 24px;
        }

        .login-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 5px;
        }

        .login-field {
          margin-bottom: 16px;
        }

        .login-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          border: 1.5px solid #e8e2d8;
          background: #fdfcfa;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }

        .login-input::placeholder {
          color: #bbb;
        }

        .login-error {
          background: #fff5f5;
          border: 1px solid #fcd5d5;
          color: #c0392b;
          font-size: 12px;
          padding: 9px 12px;
          border-radius: 7px;
          margin-bottom: 16px;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: #c9a84c;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.15s, opacity 0.15s, box-shadow 0.15s;
          letter-spacing: 0.2px;
        }

        .login-btn:hover:not(:disabled) {
          background: #b8973f;
          box-shadow: 0 4px 12px rgba(201,168,76,0.3);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          font-size: 11px;
          color: #bbb;
          margin-top: 24px;
          letter-spacing: 0.3px;
        }

        .login-footer span {
          color: #c9a84c;
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <div className="login-logo">Your<span>Trainer</span></div>
          <div className="login-tagline">India's Trainer Platform</div>

          <div className="login-title">Welcome back</div>
          <div className="login-sub">Role detected automatically on login</div>

          {error && <div className="login-error">⚠ {error}</div>}

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="you@yourtrainer.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="login-btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="login-footer">
            <span>Admin</span> · <span>Trainer</span> · <span>Client</span> — one login
          </div>
        </div>
      </div>
    </>
  );
}
