"use client";

import Link from "next/link";
import type { Customer, Project } from "@/lib/types";
import styles from "./ProjectDetail.module.css";

const STATUS_COLOR: Record<string, string> = {
  active: "var(--green)",
  at_risk: "var(--red)",
  paused: "var(--yellow)",
  completed: "var(--text-dim)",
};

interface Props {
  customer: Customer;
  project: Project;
}

export default function ProjectDetailClient({ customer, project }: Props) {
  const statusColor = STATUS_COLOR[project.status] ?? "var(--text-dim)";

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link href="/customers" className={styles.crumbLink}>Customers</Link>
          <span className={styles.crumbSep}>›</span>
          <Link href="/customers" className={styles.crumbLink}>{customer.name}</Link>
          <span className={styles.crumbSep}>›</span>
          <span className={styles.crumbCurrent}>{project.name}</span>
        </div>
        <span
          className={styles.statusBadge}
          style={{ color: statusColor, borderColor: statusColor }}
        >
          {project.status.replace("_", " ")}
        </span>
      </header>

      <div className={styles.body}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroMeta}>
            <div className={styles.customerLabel}>{customer.name}</div>
            <h1 className={styles.projectName}>{project.name}</h1>
            {project.description && (
              <p className={styles.projectDesc}>{project.description}</p>
            )}
            <div className={styles.projectDetails}>
              {project.lead && (
                <span>Lead: <strong>{project.lead}</strong></span>
              )}
              {project.startDate && <span>Start: {project.startDate}</span>}
              {project.endDate && <span>End: {project.endDate}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>LIGHT STATUS</div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>2</div>
              <div className={styles.statLabel}>TOTAL LIGHTS</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: "var(--green)" }}>100%</div>
              <div className={styles.statLabel}>LIGHTS WORKING</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>0</div>
              <div className={styles.statLabel}>TOTAL FAULTS</div>
            </div>
          </div>
        </div>

        {/* Poles */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>POLES</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>POLE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {["pole-1", "pole-2"].map((poleId, i) => (
                  <tr key={poleId}>
                    <td className={styles.poleName}>
                      <Link
                        href={`/customers/${customer.id}/projects/${project.id}/poles/${poleId}`}
                        className={styles.poleLink}
                      >
                        Pole {i + 1}
                      </Link>
                    </td>
                    <td><span className={styles.statusChip}>● Online</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
