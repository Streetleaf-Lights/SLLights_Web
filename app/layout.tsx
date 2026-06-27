import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Streetleaf - Customer Dashboard",
  description: "Internal customer dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div className="siteBody">
          <SiteNav />
          <main className="siteMain">{children}</main>
        </div>
      </body>
    </html>
  );
}
