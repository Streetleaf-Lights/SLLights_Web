import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Streetleaf - Customer Dashboard",
  description: "Internal customer dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <Link href="/">
            <Image
              src="/streetleaf-logo.png"
              alt="Streetleaf Lights"
              width={180}
              height={48}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
        </header>
        <div className="siteBody">
          <nav className="siteNav">
            <Link href="/customers" className="siteNavLink">◈ Customers</Link>
            <Link href="/poles" className="siteNavLink">◈ Poles</Link>
            <Link href="/users" className="siteNavLink">◈ Users</Link>
          </nav>
          <main className="siteMain">{children}</main>
        </div>
      </body>
    </html>
  );
}
