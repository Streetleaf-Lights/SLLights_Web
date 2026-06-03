import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azure Dashboard",
  description: "Internal Azure resource dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
