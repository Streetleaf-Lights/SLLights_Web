"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  const isRegister = ["/register", "/signin", "/forgot-password", "/reset-password"].includes(pathname);

  const logo = (
    <Image
      src="/streetleaf-logo.png"
      alt="Streetleaf Lights"
      width={180}
      height={48}
      priority
      style={{ objectFit: "contain" }}
    />
  );

  return (
    <header className="siteHeader">
      {isRegister ? logo : <Link href="/">{logo}</Link>}
    </header>
  );
}