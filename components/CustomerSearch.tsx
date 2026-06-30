"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Customer, Project } from "@/lib/types";
import { getProjectData } from "@/lib/customers";
import styles from "./CustomerSearch.module.css";

const TIER_COLOR: Record<string, string> = {
  enterprise: "var(--accent)",
  growth: "var(--green)",
  starter: "var(--yellow)",
};

const STATUS_COLOR: Record<string, string> = {
  active: "var(--green)",
  at_risk: "var(--red)",
  paused: "var(--yellow)",
  completed: "var(--text-dim)",
};
function workingPctColor(pct: number): string {
  return pct < 50 ? "var(--red)" : "var(--green)";
}

function ProjectCard({ project, customerId, cust_q, deviceCount, isWorkingCount }: { 
  project: Project; 
  customerId: string; 
  cust_q?: string;
  deviceCount: number | null | undefined;
  isWorkingCount: number | null | undefined;
}) {
  const color = STATUS_COLOR[project.status] ?? "var(--text-dim)";
  const projectHref = cust_q
    ? `/customers/${customerId}/projects/${project.id}?cust_q=${encodeURIComponent(cust_q)}`
    : `/customers/${customerId}/projects/${project.id}`;
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
        {project.description && <p className={styles.projectDesc}>{project.description}</p>}
        <div className={styles.projectMeta}>
          {project.lead && <span>Lead: <b>{project.lead}</b></span>}
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
            style={{ color: deviceCount === undefined ? undefined : workingPctColor(parseInt(lightsWorkingPct)) }}
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

function MultipleCustomerPanel({ customers, query }: { customers: Customer[]; query: string }) {
  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>{customers.length} CUSTOMERS FOUND</div>
        <div className={styles.projectGrid}>
          {customers.map((customer) => {
            const tierColor = TIER_COLOR[customer.tier ?? ""] ?? "var(--text-muted)";
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}?cust_q=${encodeURIComponent(query)}`}
                className={styles.projectCard}
                style={{ textDecoration: "none", display: "flex" }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div className={styles.projectHeader}>
                    <div className={styles.heroAvatar} style={{ fontSize: "0.75rem", width: "2rem", height: "2rem", lineHeight: "2rem", flexShrink: 0 }}>
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={styles.projectNameLink} style={{ flex: 1 }}>{customer.name}</span>
                    <span className={styles.projectMeta} style={{ display: "flex", gap: "14px", margin: 0 }}>
                      <span>{customer.projects.length} projects</span>
                    </span>
                    {customer.tier && (
                      <span className={styles.badge} style={{ color: tierColor, borderColor: tierColor }}>
                        {customer.tier.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={styles.projectMeta}>
                    {customer.industry && <span>{customer.industry}</span>}
                    {customer.region && <span>{customer.region}</span>}
                    {customer.since && <span>since {customer.since}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CustomerPanel({ customer, cust_q }: { customer: Customer; cust_q?: string }) {
  const fullAddress = [
    customer.customerAddress,
    customer.customerCity,
    customer.customerState,
    customer.customerZip,
  ].filter(Boolean);
  
  const [deviceCountMap, setDeviceCountMap] = useState<Record<string, number | null | undefined>>({});
  const [isWorkingCountMap, setIsWorkingCountMap] = useState<Record<string, number | null | undefined>>({});
  const PAGE_SIZE = 10;
  const [projectPage, setProjectPage] = useState(1);
  const totalProjectPages = Math.max(1, Math.ceil(customer.projects.length / PAGE_SIZE));
  const pagedProjects = customer.projects.slice((projectPage - 1) * PAGE_SIZE, projectPage * PAGE_SIZE);

  useEffect(() => {
    if (customer.projects.length === 0) return;
    setDeviceCountMap({});
    setIsWorkingCountMap({});
    customer.projects.forEach((p) => {
      getProjectData(p.id).then((data) => {
        setDeviceCountMap((prev) => ({
          ...prev,
          [p.id]: data?.deviceCount ?? null,
        }));
        setIsWorkingCountMap((prev) => ({ ...prev, [p.id]: data?.isWorkingCount ?? null }));
      });
    });
  }, [customer.id]);

  const allLoaded = customer.projects.every((p) => deviceCountMap[p.id] !== undefined);
  const totalLights = customer.projects.reduce((sum, p) => {
    const n = deviceCountMap[p.id];
    return typeof n === "number" ? sum + n : sum;
  }, 0);
  const totalWorking = customer.projects.reduce((sum, p) => {
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
  return (
    <div className={styles.panel}>
      <div className={styles.hero}>
        <div className={styles.heroAvatar}>{customer.name.slice(0, 2).toUpperCase()}</div>
        <div className={styles.heroInfo}>
          <div className={styles.heroName}>{customer.name}</div>
          <div className={styles.heroMeta}>
            {customer.industry && <span>{customer.industry}</span>}
            {customer.region && <span>{customer.region}</span>}
            {customer.since && <span>since {customer.since}</span>}
            {customer.website && (
              <a href={customer.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {customer.website.replace(/^https?:\/\//, "")} ↗
              </a>
            )}
          </div>
          {fullAddress.length > 0 && (
            <div className={styles.addressBlock}>
              {customer.customerAddress && <div>{customer.customerAddress}</div>}
              {(customer.customerCity || customer.customerState || customer.customerZip) && (
                <div>
                  {[customer.customerCity, customer.customerState].filter(Boolean).join(", ")}
                  {customer.customerZip ? ` ${customer.customerZip}` : ""}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatN}>{customer.projects.length}</span>
            <span className={styles.heroStatL}>PROJECTS</span>
          </div>
        </div>
        {customer.tier && (
          <span className={styles.tierBadge} style={{
            color: TIER_COLOR[customer.tier] ?? "var(--text-muted)",
            borderColor: TIER_COLOR[customer.tier] ?? "var(--border)",
          }}>
            {customer.tier.toUpperCase()}
          </span>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>SUMMARY</div>
        <div className={styles.summaryTable}>
          <div className={styles.summaryCol}>
            <div className={styles.summaryValue}>{allLoaded ? totalLights : "…"}</div>
            <div className={styles.summaryLabel}>TOTAL LIGHTS</div>
          </div>
          <div className={styles.summarySep} />
          <div className={styles.summaryCol}>
            <div
              className={styles.summaryValue}
              style={{ color: allLoaded && lightsWorkingNum !== null ? workingPctColor(lightsWorkingNum) : undefined }}
            >
              {allLoaded ? lightsWorkingPct : "…"}
            </div>
            <div className={styles.summaryLabel}>LIGHTS WORKING</div>
          </div>
          <div className={styles.summarySep} />
          <div className={styles.summaryCol}>
            <div className={styles.summaryValue}>
              {allLoaded ? (totalFaults ?? "—") : "…"}
            </div>
            <div className={styles.summaryLabel}>TOTAL FAULTS</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>PROJECTS</div>
        {customer.projects.length === 0
          ? <div className={styles.empty}>No projects on record.</div>
          : <>
              <div className={styles.projectGrid}>
                {pagedProjects.map((p) => <ProjectCard key={p.id} project={p} customerId={customer.id} cust_q={cust_q} deviceCount={deviceCountMap[p.id]} isWorkingCount={isWorkingCountMap[p.id]} />)}
              </div>
              {totalProjectPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                  <button onClick={() => setProjectPage(1)} disabled={projectPage === 1} style={pageButtonStyle}>
                    First (1)
                  </button>
                  <button onClick={() => setProjectPage(p => Math.max(1, p - 1))} disabled={projectPage === 1} style={pageButtonStyle}>
                    ← Prev
                  </button>
                  {projectPage - 2 > 1 && <span style={{ alignSelf: "center", color: "var(--text-dim)", fontSize: "12px" }}>…</span>}
                  {Array.from({ length: totalProjectPages }, (_, i) => i + 1)
                    .filter(p => p >= projectPage - 2 && p <= projectPage + 2)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setProjectPage(p)}
                        style={{
                          ...pageButtonStyle,
                          background: p === projectPage ? "var(--accent)" : "var(--surface)",
                          color: p === projectPage ? "#fff" : "var(--text)",
                          borderColor: p === projectPage ? "var(--accent)" : "var(--border)",
                          fontWeight: p === projectPage ? 700 : 400,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    {projectPage + 2 < totalProjectPages && <span style={{ alignSelf: "center", color: "var(--text-dim)", fontSize: "12px" }}>…</span>}
                    <button onClick={() => setProjectPage(p => Math.min(totalProjectPages, p + 1))} disabled={projectPage === totalProjectPages} style={pageButtonStyle}>
                      Next →
                    </button>
                    <button onClick={() => setProjectPage(totalProjectPages)} disabled={projectPage === totalProjectPages} style={pageButtonStyle}>
                      Last ({totalProjectPages})
                    </button>
                </div>
              )}
            </>
        }
      </div>
    </div>
  );
}

export default function CustomerSearch({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    if (!searchParams.has("q")) {
      setInputValue("");
    }
  }, [searchParams]);

  // URL param drives the results
  const committedQuery = searchParams.get("q") ?? "";
  const submitted = searchParams.has("q");

  const matches = submitted && committedQuery.trim()
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(committedQuery.trim().toLowerCase())
      )
    : [];

  function commitSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);   // update input immediately — no remount, focus stays
    commitSearch(value);    // sync URL in background with replace
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commitSearch(inputValue);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <span className={styles.navText}>
            <span className={styles.accent}>◈</span> CUSTOMERS
          </span>
        </div>
      </header>

      <div className={styles.main}>
        <div className={styles.dropdownRow}>
          <label className={styles.dropdownLabel}>SEARCH CUSTOMER</label>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div className={styles.selectWrap} style={{ flex: 1 }}>
              <input
                name="q"
                className={styles.select}
                type="text"
                placeholder="Enter customer name…"
                value={inputValue}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            <button type="submit" className={styles.badge} style={{
              cursor: "pointer",
              padding: "0.4rem 1rem",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              borderRadius: "4px",
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}>
              SEARCH
            </button>
          </form>
        </div>

        {submitted && committedQuery.trim() && (
          matches.length === 0
            ? <div className={styles.empty}>There are no matching customers. Please try a different search.</div>
            : matches.length === 1
              ? <CustomerPanel customer={matches[0]} cust_q={committedQuery || undefined} />
              : <MultipleCustomerPanel customers={matches} query={committedQuery} />
        )}
      </div>
    </div>
  );
}

const pageButtonStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  borderRadius: "4px",
  fontSize: "12px",
  cursor: "pointer",
};
