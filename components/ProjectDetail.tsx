"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Customer, Device, Project } from "@/lib/types";
import { getProjectData } from "@/lib/customers";
import styles from "./ProjectDetail.module.css";

const STATUS_COLOR: Record<string, string> = {
  active: "var(--green)",
  at_risk: "var(--red)",
  paused: "var(--yellow)",
  completed: "var(--text-dim)",
};
function workingPctColor(pct: number): string {
  return pct < 50 ? "var(--red)" : "var(--green)";
}

interface Props {
  customer: Customer;
  project: Project;
  sessionRole: string;
}

function PolesMap({ devices }: { devices: Device[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  const validDevices = devices.filter(
    (d) => d.lat != null && d.long != null && !(d.lat === 0 && d.long === 0)
  );

  useEffect(() => {
    if (!mapRef.current || validDevices.length === 0) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const initMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;

      const bounds = new google.maps.LatLngBounds();
      validDevices.forEach((d) => bounds.extend({ lat: d.lat!, lng: d.long! }));

      const map = new google.maps.Map(mapRef.current, {
        mapTypeId: "satellite",
      });
      map.fitBounds(bounds);

      validDevices.forEach((d) => {
        new google.maps.Marker({
          position: { lat: d.lat!, lng: d.long! },
          map,
          title: `Pole ${d.poleNumber}`,
          label: {
            text: String(d.poleNumber),
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "bold",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: d.isOnline ? "#1D9E75" : "#E24B4A",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      });
    };

    const scriptId = "google-maps-script";
    if ((window as any).google?.maps) {
      initMap();
      return;
    }
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      document.getElementById(scriptId)!.addEventListener("load", initMap);
    }
  }, [validDevices.length]);

  if (validDevices.length === 0) {
    return <div style={{ fontSize: 12, color: "var(--text-dim)" }}>No location data available for poles in this project.</div>;
  }

  return (
    <div ref={mapRef} style={{ width: "100%", height: 400, border: "1px solid var(--border)" }} />
  );
}

export default function ProjectDetail({ customer, project, sessionRole }: Props) {
  const statusColor = STATUS_COLOR[project.status] ?? "var(--text-dim)";
  const searchParams = useSearchParams();
  const cust_qQuery = searchParams.get("cust_q");
  const backHref = cust_qQuery
    ? `/customers?q=${encodeURIComponent(cust_qQuery)}`
    : "/customers";
  const [deviceCount, setDeviceCount] = useState<number | null | undefined>(undefined);
  const [isWorkingCount, setIsWorkingCount] = useState<number | null | undefined>(undefined);
  const [devices, setDevices] = useState<Device[] | undefined>(undefined);
  const PAGE_SIZE = 10;
  const [polePage, setPolePage] = useState(1);

  useEffect(() => {
    getProjectData(project.id).then((data) => {
      setDeviceCount(data?.deviceCount ?? null);
      setIsWorkingCount(data?.isWorkingCount ?? null);
      setDevices(data?.devices ?? []);
    });
  }, [project.id]);
  const lightsWorkingNum: number | null =
    typeof deviceCount === "number" && typeof isWorkingCount === "number" && deviceCount > 0
      ? Math.round((isWorkingCount / deviceCount) * 100)
      : null;

  const lightsWorkingPct: string = lightsWorkingNum !== null ? `${lightsWorkingNum}%` : "—";
  const faultCount: number | null =
    typeof deviceCount === "number" && typeof isWorkingCount === "number"
      ? deviceCount - isWorkingCount
      : null;
  const pole_qQuery = searchParams.get("pole_q");
  const totalPolePages = devices ? Math.max(1, Math.ceil(devices.length / PAGE_SIZE)) : 1;
  const pagedDevices = devices ? devices.slice((polePage - 1) * PAGE_SIZE, polePage * PAGE_SIZE) : undefined;
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
                  <Link href={backHref} className={styles.crumbLink}>
                    ← Customer Search: "{cust_qQuery}"
                  </Link>
                </>
              )}
              <span className={styles.crumbSep}>›</span>
              <Link
                href={`/customers/${customer.id}${cust_qQuery ? `?cust_q=${encodeURIComponent(cust_qQuery)}` : ""}${pole_qQuery ? `${cust_qQuery ? "&" : "?"}pole_q=${encodeURIComponent(pole_qQuery)}` : ""}`}
                className={styles.crumbLink}
              >
                {customer.name}
              </Link>
            </div>
          )}

          {pole_qQuery && (
            <div className={styles.breadcrumb} style={{ borderTop: sessionRole !== "Customer Admin" ? "1px solid var(--border)" : undefined, paddingTop: sessionRole !== "Customer Admin" ? "10px" : undefined }}>
              <span className={styles.navText}>
                <span className={styles.accent}>◈</span> POLES
              </span>
              <Link
                href={`/poles?q=${encodeURIComponent(pole_qQuery)}`}
                className={styles.crumbLink}
              >
                ← Pole Search: "{pole_qQuery}"
              </Link>
            </div>
          )}
        </header>
      )}
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
              <div className={styles.statValue}>{deviceCount === undefined ? "…" : (deviceCount ?? "—")}</div>
              <div className={styles.statLabel}>TOTAL LIGHTS</div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statValue}
                style={{ color: deviceCount === undefined ? undefined : lightsWorkingNum !== null ? workingPctColor(lightsWorkingNum) : undefined }}
              >
                {deviceCount === undefined ? "…" : lightsWorkingPct}
              </div>
              <div className={styles.statLabel}>LIGHTS WORKING</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {deviceCount === undefined ? "…" : (faultCount ?? "—")}
              </div>
              <div className={styles.statLabel}>TOTAL FAULTS</div>
            </div>
          </div>
        </div>
        {/* Map */}
        {devices !== undefined && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>POLE LOCATIONS</div>
            <PolesMap devices={devices} />
          </div>
        )}
        {devices !== undefined && (
          <div dangerouslySetInnerHTML={{
            __html: `<!-- Pole coordinates:\n${devices.map((d) => `  Pole ${d.poleNumber}: lat=${d.lat ?? "—"}, long=${d.long ?? "—"}`).join("\n")}\n-->`
          }} />
        )}
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
                {devices === undefined ? (
                  <tr>
                    <td colSpan={2} className={styles.empty}>…</td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles.empty}>No poles on record.</td>
                  </tr>
                ) : (
                  pagedDevices!.map((device) => (
                    <tr key={device.id}>
                      <td className={styles.poleName}>
                        <Link
                          href={`/customers/${customer.id}/projects/${project.id}/poles/${device.id}${cust_qQuery ? `?cust_q=${encodeURIComponent(cust_qQuery)}` : ""}${pole_qQuery ? `${cust_qQuery ? "&" : "?"}pole_q=${encodeURIComponent(pole_qQuery)}` : ""}`}
                          className={styles.poleLink}
                        >
                          {device.poleNumber}
                        </Link>
                      </td>
                      <td>
                        <span
                          className={styles.statusChip}
                          style={{ color: device.isOnline ? "var(--green)" : "var(--red)" }}
                        >
                          ● {device.isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {devices && devices.length > 0 && totalPolePages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setPolePage(1)} disabled={polePage === 1} style={pageButtonStyle}>
                First (1)
              </button>
              <button onClick={() => setPolePage(p => Math.max(1, p - 1))} disabled={polePage === 1} style={pageButtonStyle}>
                ← Prev
              </button>
              {polePage - 2 > 1 && <span style={{ alignSelf: "center", color: "var(--text-dim)", fontSize: "12px" }}>…</span>}
              {Array.from({ length: totalPolePages }, (_, i) => i + 1)
                .filter(p => p >= polePage - 2 && p <= polePage + 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => setPolePage(p)}
                    style={{
                      ...pageButtonStyle,
                      background: p === polePage ? "var(--accent)" : "var(--surface)",
                      color: p === polePage ? "#fff" : "var(--text)",
                      borderColor: p === polePage ? "var(--accent)" : "var(--border)",
                      fontWeight: p === polePage ? 700 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
              {polePage + 2 < totalPolePages && <span style={{ alignSelf: "center", color: "var(--text-dim)", fontSize: "12px" }}>…</span>}
                <button onClick={() => setPolePage(p => Math.min(totalPolePages, p + 1))} disabled={polePage === totalPolePages} style={pageButtonStyle}>
                  Next →
                </button>
                <button onClick={() => setPolePage(totalPolePages)} disabled={polePage === totalPolePages} style={pageButtonStyle}>
                  Last ({totalPolePages})
                </button>
            </div>
          )}
        </div>
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
