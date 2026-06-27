"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/customers";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit() {
    const newEmailError = !email
      ? "Email is required."
      : !EMAIL_REGEX.test(email)
      ? "Please enter a valid email address."
      : null;
    setEmailError(newEmailError);
    if (newEmailError) return;
    if (!password) { setError("Password is required."); return; }
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.success) { setError(result.error ?? "An unexpected error occurred."); return; }
    window.location.href = "/customers";
  }

  return (
    <main style={{ padding: "40px", maxWidth: "480px", margin: "0 auto" }}>
      <h1>Sign In</h1>

      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => {
            const val = e.target.value;
            setEmail(val);
            setEmailError(val && !EMAIL_REGEX.test(val) ? "Please enter a valid email address." : null);
          }}
          placeholder="user@example.com"
          style={inputStyle}
        />
        {emailError && <p style={fieldErrorStyle}>{emailError}</p>}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label style={labelStyle}>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => { setPassword(e.target.value); setError(null); }}
            placeholder="Enter your password"
            style={{ ...inputStyle, paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={eyeButtonStyle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>

      <div style={{ textAlign: "right", marginBottom: "24px" }}>
        <Link href="/forgot-password" style={{ fontSize: "13px", color: "#00b1ae", textDecoration: "none" }}>
          Forgot password?
        </Link>
      </div>

      {error && <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </main>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#888",
  padding: "0",
  display: "flex",
  alignItems: "center",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#00b1ae",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
};

const fieldErrorStyle: React.CSSProperties = {
  color: "#c0392b",
  fontSize: "12px",
  marginTop: "4px",
  marginBottom: "0",
};
