"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/customers";
import Link from "next/link";

const SPECIAL_CHAR = /[^a-zA-Z0-9]/;

function validate(password: string, confirm: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!SPECIAL_CHAR.test(password)) return "Password must include at least 1 special character.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
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

function PasswordInput({ value, onChange, placeholder, onKeyDown, }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        style={{ ...inputStyle, paddingRight: "40px" }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={eyeButtonStyle}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

export default function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  async function handleSubmit() {
    const err = validate(password, confirm);
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    const result = await resetPassword(email!, token!, password);
    setLoading(false);
    if (!result.success) { setError(result.error ?? "An unexpected error occurred."); return; }
    setSubmitted(true);
  }

  return (
    <main style={{ padding: "40px", maxWidth: "480px", margin: "0 auto" }}>
      <h1>Reset Password</h1>
      {!token || !email ? (
        <p style={{ color: "#888" }}>Invalid or missing reset link.</p>
      ) : submitted ? (
        <>
          <p style={{ color: "#00b1ae", marginBottom: "16px" }}>Your password has been reset.</p>
          <Link href="/signin" style={buttonStyle}>Go to Sign In</Link>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>New Password</label>
            <PasswordInput
              value={password}
              onChange={v => { setPassword(v); setError(null); }}
              placeholder="At least 8 characters"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>Confirm Password</label>
            <PasswordInput
              value={confirm}
              onChange={v => { setConfirm(v); setError(v && password !== v ? "Passwords do not match." : null); }}
              placeholder="Re-enter password"
              onKeyDown={handleKeyDown}
            />
          </div>

          <ul style={hintStyle}>
            <li style={{ color: password.length >= 8 ? "#00b1ae" : "#aaa" }}>
              At least 8 characters
            </li>
            <li style={{ color: SPECIAL_CHAR.test(password) ? "#00b1ae" : "#aaa" }}>
              At least 1 special character (!@#$%...)
            </li>
          </ul>

          {error && <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

          <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
            {loading ? "Resetting password…" : "Reset Password"}
          </button>
        </>
      )}
    </main>
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

const hintStyle: React.CSSProperties = {
  fontSize: "12px",
  paddingLeft: "18px",
  marginBottom: "16px",
  lineHeight: "1.8",
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