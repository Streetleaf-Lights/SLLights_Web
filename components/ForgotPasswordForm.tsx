"use client";
import Link from "next/link";
import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const error = !email
      ? "Email is required."
      : !EMAIL_REGEX.test(email)
      ? "Please enter a valid email address."
      : null;
    setEmailError(error);
    if (error) return;
    setLoading(true);
    await fetch("/api/azure/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Always show success to avoid revealing if email exists
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main style={{ padding: "40px", maxWidth: "480px", margin: "0 auto" }}>
      <h1>Forgot Password</h1>

      {submitted ? (
        <>
          <p style={{ color: "#00b1ae", marginBottom: "16px" }}>
            If an account exists for that email, a reset link has been sent.
          </p>
          <Link href="/signin" style={linkStyle}>Back to Sign In</Link>
        </>
      ) : (
        <>
          <p style={{ color: "#888", marginBottom: "24px", fontSize: "13px" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div style={{ marginBottom: "8px" }}>
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

          <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
            {loading ? "Submitting…" : "Submit"}
          </button>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link href="/signin" style={linkStyle}>Back to Sign In</Link>
          </div>
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

const fieldErrorStyle: React.CSSProperties = {
  color: "#c0392b",
  fontSize: "12px",
  marginTop: "4px",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "16px",
  background: "#00b1ae",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
};

const linkStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#00b1ae",
  textDecoration: "none",
};