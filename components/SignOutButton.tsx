"use client";
import { useState } from "react";

export default function SignOutButton() {
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSignOut() {
    await fetch("/api/azure/sign-out", { method: "POST" });
    window.location.href = "/signin";
  }

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="siteNavLink" style={buttonStyle}>
        ⇤ Sign Out
      </button>

      {modalOpen && (
        <div style={overlayStyle} onClick={() => setModalOpen(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === "Enter") handleSignOut(); }}
            tabIndex={-1}
            ref={el => el?.focus()}
          >
            <p style={{ margin: "0 0 24px", color: "var(--text)", lineHeight: 1.6 }}>
              Are you sure you want to sign out?
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)} style={cancelStyle}>
                Cancel
              </button>
              <button onClick={handleSignOut} style={confirmStyle}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  width: "100%",
  textAlign: "left",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "8px",
  padding: "32px",
  width: "320px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

const cancelStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "none",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  color: "var(--text-muted)",
};

const confirmStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "var(--accent)",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  color: "#fff",
};