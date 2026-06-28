"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";

export default function SiteNavClient({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname();
  if (["/register", "/signin", "/forgot-password", "/reset-password"].includes(pathname)) return null;

  return (
    <nav className="siteNav" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        <Link href="/customers" className="siteNavLink">◈ Customers</Link>
        <Link href="/poles" className="siteNavLink">◈ Poles</Link>
        <Link href="/users" className="siteNavLink">◈ Users</Link>
      </div>
      {isSignedIn && (
        <div style={{ borderTop: "1px solid var(--yellow-dim)", paddingTop: "8px" }}>
          <SignOutButton />
        </div>
      )}
    </nav>
  );
}
