"use client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/azure/sign-out", { method: "POST" });
    router.push("/signin");
  }

  return (
    <button onClick={handleSignOut} className="siteNavLink" style={buttonStyle}>
      ⇤ Sign Out
    </button>
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