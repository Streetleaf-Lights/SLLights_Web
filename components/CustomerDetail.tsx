"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Customer, Project } from "@/lib/types";
import { getProjectData } from "@/lib/customers";
import styles from "./CustomerDetail.module.css";

const STATUS_COLOR: Record<string, string> = {
  active: "var(--green)",
  at_risk: "var(--red)",
  paused: "var(--yellow)",
  completed: "var(--text-dim)",
};

const TIER_COLOR: Record<string, string> = {
  enterprise: "var(--accent)",
  growth: "var(--green)",
  starter: "var(--yellow)",
};
function workingPctColor(pct: number): string {
  return pct < 50 ? "var(--red)" : "var(--green)";
}

function ProjectCard({ project, customerId, cust_q, pole_q, deviceCount, isWorkingCount }: { project: Project; customerId: string; cust_q?: string; pole_q?: string;deviceCount: number | null | undefined;isWorkingCount: number | null | undefined; }) {
  const color = STATUS_COLOR[project.status] ?? "var(--text-dim)";
  const projectHref = `/customers/${customerId}/projects/${project.id}${
    cust_q ? `?cust_q=${encodeURIComponent(cust_q)}` : ""
  }${pole_q ? `${cust_q ? "&" : "?"}pole_q=${encodeURIComponent(pole_q)}` : ""}`;
  const lightsWorkingNum: number | null =
    typeof deviceCount === "number" && typeof isWorkingCount === "number" && deviceCount > 0
      ? Math.round((isWorkingCount / deviceCount) * 100)
      : null;

  const lightsWorkingPct: string = lightsWorkingNum !== null ? `${lightsWorkingNum}%` : "—";
  const faultCount: number | null =
    typeof deviceCount === "number" && typeof isWorkingCount === "number"
      ? deviceCount - isWorkingCount
      : null;
  return (
    <div className={styles.projectCard}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div className={styles.projectHeader}>
          <span className={styles.projectDot} />
          <Link href={projectHref} className={styles.projectNameLink}>
            {project.name}
          </Link>
        </div>
        {project.description && (
          <p className={styles.projectDesc}>{project.description}</p>
        )}
        <div className={styles.projectMeta}>
          {project.lead && <span>Lead: <span className={styles.highlight}>{project.lead}</span></span>}
          {project.startDate && <span>Start: {project.startDate}</span>}
          {project.endDate && <span>End: {project.endDate}</span>}
        </div>
      </div>
      <div className={styles.projectStats}>
        <div className={styles.projectStat}>
          <span className={styles.projectStatN}>{deviceCount === undefined ? "…" : (deviceCount ?? "—")}</span>
          <span className={styles.projectStatL}>TOTAL LIGHTS</span>
        </div>
        <div className={styles.projectStat}>
          <span
            className={styles.projectStatN}
            style={{ color: deviceCount === undefined ? undefined : lightsWorkingNum !== null ? workingPctColor(lightsWorkingNum) : undefined }}
          >
            {deviceCount === undefined ? "…" : lightsWorkingPct}
          </span>
          <span className={styles.projectStatL}>LIGHTS WORKING</span>
        </div>
        <div className={styles.projectStat}>
          <span className={styles.projectStatN}>
            {deviceCount === undefined ? "…" : (faultCount ?? "—")}
          </span>
          <span className={styles.projectStatL}>TOTAL FAULTS</span>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetail({ customer, sessionRole }: { customer: Customer; sessionRole: string }) {
  const searchParams = useSearchParams();
  const cust_qQuery = searchParams.get("cust_q");
  const backHref = cust_qQuery
    ? `/customers?q=${encodeURIComponent(cust_qQuery)}`
    : "/customers";
  
  const [deviceCountMap, setDeviceCountMap] = useState<Record<string, number | null | undefined>>({});
  const [isWorkingCountMap, setIsWorkingCountMap] = useState<Record<string, number | null | undefined>>({});
  const sortedProjects = [...customer.projects].sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
  useEffect(() => {
    if (sortedProjects.length === 0) return;
    setDeviceCountMap({});
    setIsWorkingCountMap({});
    sortedProjects.forEach((p) => {
      getProjectData(p.id).then((data) => {
        setDeviceCountMap((prev) => ({
          ...prev,
          [p.id]: data?.deviceCount ?? null,
        }));
        setIsWorkingCountMap((prev) => ({ ...prev, [p.id]: data?.isWorkingCount ?? null }));
      });
    });
  }, [customer.id]);

  const allLoaded = sortedProjects.every((p) => deviceCountMap[p.id] !== undefined);
  const totalLights = sortedProjects.reduce((sum, p) => {
    const n = deviceCountMap[p.id];
    return typeof n === "number" ? sum + n : sum;
  }, 0);
  const totalWorking = sortedProjects.reduce((sum, p) => {
    const n = isWorkingCountMap[p.id];
    return typeof n === "number" ? sum + n : sum;
  }, 0);

  const lightsWorkingNum: number | null =
    allLoaded && totalLights > 0
      ? Math.round((totalWorking / totalLights) * 100)
      : null;

  const lightsWorkingPct: string = lightsWorkingNum !== null ? `${lightsWorkingNum}%` : "—";
  const totalFaults: number | null =
    allLoaded && typeof totalLights === "number" && typeof totalWorking === "number"
      ? totalLights - totalWorking
      : null;
  const pole_qQuery = searchParams.get("pole_q");
  return (
    <div className={styles.page}>
      {/* Top bar */}
      {!(sessionRole === "Customer Admin" && !pole_qQuery) && (
        <header className={styles.topbar}>
          {sessionRole !== "Customer Admin" && (
            <div className={styles.breadcrumb}>
              {cust_qQuery && (
                <>
                <span className={styles.navText}>
                  <span className={styles.accent}>◈</span> CUSTOMERS
                </span>
                <Link
                  href={backHref}
                  className={styles.back}
                >
                  ← Customer Search: "{cust_qQuery}"
                </Link>
                </>
              )}
            </div>
          )}

          {pole_qQuery && (
            <div className={styles.breadcrumb} style={{ borderTop: sessionRole !== "Customer Admin" && cust_qQuery ? "1px solid var(--border)" : undefined, paddingTop: sessionRole !== "Customer Admin" && cust_qQuery ? "10px" : undefined }}>
              <span className={styles.navText}>
                <span className={styles.accent}>◈</span> POLES
              </span>
              <Link
                href={`/poles?q=${encodeURIComponent(pole_qQuery)}`}
                className={styles.back}
              >
                ← Pole Search: "{pole_qQuery}"
              </Link>
            </div>
          )}
        </header>
      )}

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroAvatar}>
          {customer.name.slice(0, 2).toUpperCase()}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{customer.name}</h1>
          <div className={styles.heroMeta}>
            {customer.industry && <span>{customer.industry}</span>}
            {customer.region && <span>{customer.region}</span>}
            {customer.since && <span>Customer since {customer.since}</span>}
            {customer.website && (
              <a href={customer.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                {customer.website.replace(/^https?:\/\//, "")} ↗
              </a>
            )}
          </div>
          {(customer.customerAddress || customer.customerCity || customer.customerState || customer.customerZip) && (
            <div className={styles.addressBlock}>
              {customer.customerAddress && <div>{customer.customerAddress}</div>}
              <div>
                {[customer.customerCity, customer.customerState].filter(Boolean).join(", ")}
                {customer.customerZip ? ` ${customer.customerZip}` : ""}
              </div>
            </div>
          )}
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatN}>{sortedProjects.length}</span>
            <span className={styles.heroStatL}>PROJECTS</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Summary table */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>SUMMARY</div>
          <div className={styles.summaryTable}>
            <div className={styles.summaryCol}>
              <div className={styles.summaryValue}>{allLoaded ? totalLights : "…"}</div>
              <div className={styles.summaryLabel}>TOTAL LIGHTS</div>
            </div>
            <div className={styles.summaryCol} style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
              <div
                className={styles.summaryValue}
                style={{ color: allLoaded && lightsWorkingNum !== null ? workingPctColor(lightsWorkingNum) : undefined }}
              >
                {allLoaded ? lightsWorkingPct : "…"}
              </div>
              <div className={styles.summaryLabel}>LIGHTS WORKING</div>
            </div>
            <div className={styles.summaryCol}>
              <div className={styles.summaryValue}>
                {allLoaded ? (totalFaults ?? "—") : "…"}
              </div>
              <div className={styles.summaryLabel}>TOTAL FAULTS</div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>PROJECTS</div>
          {sortedProjects.length === 0 ? (
            <div className={styles.empty}>No projects on record.</div>
          ) : (
            <div className={styles.projectGrid}>
              {sortedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} customerId={customer.id} cust_q={cust_qQuery ?? undefined} pole_q={pole_qQuery ?? undefined} deviceCount={deviceCountMap[p.id]} isWorkingCount={isWorkingCountMap[p.id]} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
