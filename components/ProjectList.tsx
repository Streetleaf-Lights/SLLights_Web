"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { getProjectData } from "@/lib/customers";
import styles from "./ProjectList.module.css";

const STATUS_COLOR: Record<string, string> = {
  active:    "var(--green)",
  at_risk:   "var(--red)",
  paused:    "var(--yellow)",
  completed: "var(--text-dim)",
};

function workingPctColor(pct: number): string {
  return pct < 50 ? "var(--red)" : "var(--green)";
}

function ProjectCard({
  project, customerId, deviceCount, isWorkingCount,
}: {
  project: Project;
  customerId: string;
  deviceCount: number | null | undefined;
  isWorkingCount: number | null | undefined;
}) {
  const projectHref = `/customers/${customerId}/projects/${project.id}`;

  const lightsWorkingNum: number | null =
    typeof deviceCount === "number" && typeof isWorkingCount === "number" && deviceCount > 0
      ? Math.round((isWorkingCount / deviceCount) * 100)
      : null;

  const lightsWorkingPct = lightsWorkingNum !== null ? `${lightsWorkingNum}%` : "—";
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
          {project.lead      && <span>Lead: <span className={styles.highlight}>{project.lead}</span></span>}
          {project.startDate && <span>Start: {project.startDate}</span>}
          {project.endDate   && <span>End: {project.endDate}</span>}
        </div>
      </div>
      <div className={styles.projectStats}>
        <div className={styles.projectStat}>
          <span className={styles.projectStatN}>
            {deviceCount === undefined ? "…" : (deviceCount ?? "—")}
          </span>
          <span className={styles.projectStatL}>TOTAL LIGHTS</span>
        </div>
        <div className={styles.projectStat}>
          <span
            className={styles.projectStatN}
            style={{ color: lightsWorkingNum !== null ? workingPctColor(lightsWorkingNum) : undefined }}
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

export default function ProjectList({ customerId }: { customerId: string }) {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [loading, setLoading]           = useState(true);
  const [deviceCountMap, setDeviceCountMap]     = useState<Record<string, number | null | undefined>>({});
  const [isWorkingCountMap, setIsWorkingCountMap] = useState<Record<string, number | null | undefined>>({});
  const [customerName, setCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [customerCity, setCustomerCity]       = useState<string>("");
  const [customerState, setCustomerState]     = useState<string>("");
  const [customerZip, setCustomerZip]         = useState<string>("");

  useEffect(() => {
    fetch("/api/azure/customer-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    })
      .then(r => r.json())
      .then(data => {
        setCustomerName(data?.name ?? "");
        setCustomerAddress(data?.customerAddress ?? "");
        setCustomerCity(data?.customerCity ?? "");
        setCustomerState(data?.customerState ?? "");
        setCustomerZip(data?.customerZip ?? "");
        const raw: Project[] = Array.isArray(data?.projects) ? data.projects : [];
        const sorted = [...raw].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        setProjects(sorted);
        sorted.forEach(p => {
          getProjectData(p.id).then(d => {
            setDeviceCountMap(prev  => ({ ...prev,  [p.id]: d?.deviceCount   ?? null }));
            setIsWorkingCountMap(prev => ({ ...prev, [p.id]: d?.isWorkingCount ?? null }));
          });
        });
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [customerId]);

  const allLoaded     = projects.every(p => deviceCountMap[p.id] !== undefined);
  const totalLights   = projects.reduce((sum, p) => sum + (typeof deviceCountMap[p.id]   === "number" ? (deviceCountMap[p.id] as number)   : 0), 0);
  const totalWorking  = projects.reduce((sum, p) => sum + (typeof isWorkingCountMap[p.id] === "number" ? (isWorkingCountMap[p.id] as number) : 0), 0);
  const lightsWorkingNum = allLoaded && totalLights > 0 ? Math.round((totalWorking / totalLights) * 100) : null;
  const lightsWorkingPct = lightsWorkingNum !== null ? `${lightsWorkingNum}%` : "—";
  const totalFaults      = allLoaded ? totalLights - totalWorking : null;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <span className={styles.navText}>
            <span className={styles.accent}>◈</span> PROJECTS
          </span>
        </div>
      </header>
      <div className={styles.hero}>
        <div className={styles.heroAvatar}>
          {customerName ? customerName.slice(0, 2).toUpperCase() : "…"}
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>{customerName || "…"}</h1>
          {(customerAddress || customerCity || customerState || customerZip) && (
            <div className={styles.addressBlock}>
              {customerAddress && <div>{customerAddress}</div>}
              <div>
                {[customerCity, customerState].filter(Boolean).join(", ")}
                {customerZip ? ` ${customerZip}` : ""}
              </div>
            </div>
          )}
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatN}>{projects.length}</span>
            <span className={styles.heroStatL}>PROJECTS</span>
          </div>
        </div>
      </div>
      <div className={styles.body}>
        {/* Summary */}
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
              <div className={styles.summaryValue}>{allLoaded ? (totalFaults ?? "—") : "…"}</div>
              <div className={styles.summaryLabel}>TOTAL FAULTS</div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>
            {loading ? "…" : `${projects.length} PROJECTS`}
          </div>
          {loading ? (
            <div className={styles.empty}>…</div>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>No projects on record.</div>
          ) : (
            <div className={styles.projectGrid}>
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  customerId={customerId}
                  deviceCount={deviceCountMap[p.id]}
                  isWorkingCount={isWorkingCountMap[p.id]}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}