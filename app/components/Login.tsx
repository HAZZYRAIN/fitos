"use client";
// ============================================================
// YOURTRAINER — LOGIN COMPONENT
// Firebase email/password auth.
// Role is auto-detected from Firestore profile after login.
// ============================================================
import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";

const LOGIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', sans-serif;
    background: #faf8f4;
  }

  .lw {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #faf8f4;
    font-family: 'Inter', sans-serif;
    padding: 16px;
  }

  .lc {
    width: 100%;
    max-width: 380px;
    background: #ffffff;
    border: 1px solid #ede8de;
    border-radius: 16px;
    padding: 36px 32px;
    box-shadow: 0 4px 24px rgba(180,150,80,0.08), 0 1px 4px rgba(0,0,0,0.06);
  }

  .logo-yt {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.5px;
  }

  .logo-yt span {
    color: #c9a84c;
  }

  .logo-tag {
    font-size: 10px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 3px;
  }

  .lt {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin-top: 24px;
    margin-bottom: 4px;
  }

  .ls {
    font-size: 12px;
    color: #999;
    margin-bottom: 22px;
  }

  .lerr {
    background: #fff5f5;
    border: 1px solid #fcd5d5;
    color: #c0392b;
    font-size: 12px;
    padding: 9px 12px;
    border-radius: 7px;
    margin-bottom: 14px;
  }

  .lb {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #777;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 5px;
    margin-top: 14px;
  }

  .li {
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
  }

  .li:focus {
    border-color: #c9a84c;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
  }

  .li::placeholder {
    color: #ccc;
  }

  .lbtn {
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
    margin-top: 22px;
    transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
    letter-spacing: 0.2px;
  }

  .lbtn:hover:not(:disabled) {
    background: #b8973f;
    box-shadow: 0 4px 14px rgba(201,168,76,0.35);
  }

  .lbtn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .lfoot {
    font-size: 11px;
    color: #bbb;
    text-align: center;
    margin-top: 20px;
    letter-spacing: 0.3px;
  }

  .lfoot span {
    color: #c9a84c;
    font-weight: 600;
  }
`;

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
    <>
      <style>{LOGIN_STYLES}</style>
      <div className="lw">
        <div className="lc">

          {/* Logo */}
          <div className="logo-yt">Your<span>Trainer</span></div>
          <div className="logo-tag">India's Trainer Platform</div>

          {/* Heading */}
          <div className="lt">Sign in</div>
          <div className="ls">Role detected automatically on login</div>

          {/* Error */}
          {err && <div className="lerr">⚠ {err}</div>}

          {/* Form */}
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

          {/* Footer */}
          <div className="lfoot">
            <span>Admin</span> · <span>Trainer</span> · <span>Client</span> — one login
          </div>

        </div>
      </div>
    </>
  );
}
