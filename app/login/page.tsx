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
      // ✅ MATCHES AuthContext SIGNATURE
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          background: "#111118",
          padding: 32,
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Login</h2>

        {error && (
          <div style={{ color: "#fca5a5", marginBottom: 12 }}>{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            borderRadius: 6,
          }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 6,
            background: "#6c63ff",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
