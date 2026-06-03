"use client";

import Link from "next/link";
import type { Customer, Project } from "@/lib/types";
import styles from "./PoleDetail.module.css";

interface Props {
  customer: Customer;
  project: Project;
  poleId: string;
  poleName: string;
}

function StatusBar({ value, color }: { value: number; color: string }) {
  return (
    <div className={styles.barWrap}>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className={styles.barPct} style={{ color }}>{value}%</span>
    </div>
  );
}

export default function PoleDetailClient({ customer, project, poleId, poleName }: Props) {
  const now = new Date();

  const lastUpdate = now.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const installDate = new Date(now);
  installDate.setDate(installDate.getDate() - 7);
  const installDateStr = installDate.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link href="/customers" className={styles.crumbLink}>Customers</Link>
          <span className={styles.crumbSep}>›</span>
          <Link href="/customers" className={styles.crumbLink}>{customer.name}</Link>
          <span className={styles.crumbSep}>›</span>
          <Link
            href={`/customers/${customer.id}/projects/${project.id}`}
            className={styles.crumbLink}
          >
            {project.name}
          </Link>
          <span className={styles.crumbSep}>›</span>
          <span className={styles.crumbCurrent}>{poleName}</span>
        </div>
        <span className={styles.statusBadge}>● Online</span>
      </header>

      <div className={styles.body}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}>◉</div>
          <div className={styles.heroInfo}>
            <div className={styles.projectLabel}>{project.name}</div>
            <h1 className={styles.poleName}>{poleName}</h1>
            <div className={styles.heroMeta}>
              <span>Last update: <strong>{lastUpdate}</strong></span>
              <span>Install date: <strong>{installDateStr}</strong></span>
            </div>
          </div>
          <div className={styles.heroCoords}>
            <div className={styles.coordRow}>
              <span className={styles.coordLabel}>LAT</span>
              <span className={styles.coordValue}>27.779667</span>
            </div>
            <div className={styles.coordRow}>
              <span className={styles.coordLabel}>LONG</span>
              <span className={styles.coordValue}>-82.339318</span>
            </div>
          </div>
        </div>

        {/* Status gauges */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>SYSTEM STATUS</div>
          <div className={styles.gaugeGrid}>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>LIGHT STATUS</div>
              <div className={styles.gaugeValue} style={{ color: "var(--yellow)" }}>80%</div>
              <StatusBar value={80} color="var(--yellow)" />
            </div>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>PANEL STATUS</div>
              <div className={styles.gaugeValue} style={{ color: "var(--red)" }}>50%</div>
              <StatusBar value={50} color="var(--red)" />
            </div>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>BATTERY STATUS</div>
              <div className={styles.gaugeValue} style={{ color: "var(--red)" }}>20%</div>
              <StatusBar value={20} color="var(--red)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
