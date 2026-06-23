"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Customer, Project, Device } from "@/lib/types";
import { getDeviceData, getDeviceStatuses } from "@/lib/customers";
import styles from "./PoleDetail.module.css";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

interface Props {
  customer: Customer;
  project: Project;
  poleId: string;
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
    </div>
  );
}

function gaugeColor(pct: number, isWorking?: number): string {
  if (isWorking === 2) return "var(--green)";
  if (isWorking === 0) return "var(--red)";
  if (pct >= 80) return "var(--green)";
  if (pct >= 50) return "var(--yellow)";
  return "var(--red)";
}

interface StatusRow {
  lastUpload?: unknown;
  currentPanelPercentage?: unknown;
  currentBatteryPercentage?: unknown;
  currentLightRatio?: unknown;
}

function PoleStatusChart({ statuses }: { statuses: StatusRow[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || statuses.length === 0) return;

    const labels = statuses.map((r) => {
      const d = new Date(String(r.lastUpload ?? ""));
      return isNaN(d.getTime())
        ? String(r.lastUpload ?? "")
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    });

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
    const tickColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Panel %",
            data: statuses.map((r) => Math.round(Number(r.currentPanelPercentage ?? 0))),
            borderColor: "#1D9E75",
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.35,
            fill: false,
          },
          {
            label: "Battery %",
            data: statuses.map((r) => Math.round(Number(r.currentBatteryPercentage ?? 0))),
            borderColor: "#378ADD",
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.35,
            fill: false,
          },
          {
            label: "Light ratio",
            data: statuses.map((r) => Math.round(Number(r.currentLightRatio ?? 0))),
            borderColor: "#BA7517",
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 3,
            pointStyle: "triangle",
            tension: 0.35,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            borderWidth: 1,
            titleColor: tickColor,
            bodyColor: tickColor,
            padding: 10,
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 }, maxRotation: 30, autoSkip: true, maxTicksLimit: 10 },
            border: { color: gridColor },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 }, callback: function(tickValue) {
                    return tickValue + "%";
                  } },
            border: { color: gridColor },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [statuses]);

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "var(--text-dim)", flexWrap: "wrap" }}>
        {[
          { color: "#1D9E75", label: "Panel %" },
          { color: "#378ADD", label: "Battery %" },
          { color: "#BA7517", label: "Light ratio" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ position: "relative", width: "100%", height: 260 }}>
        <canvas ref={canvasRef} role="img" aria-label="Line chart of panel, battery, and light ratio over time" />
      </div>
    </>
  );
}

function PoleMap({ lat, long }: { lat: number; long: number }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    const scriptId = "google-maps-script";
    const initMap = () => {
      if (!mapRef.current) return;
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat, lng: long },
        zoom: 17,
        mapTypeId: "satellite",
      });
      new (window as any).google.maps.Marker({
        position: { lat, lng: long },
        map,
        title: `Lat: ${lat}, Long: ${long}`,
      });
    };

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
  }, [lat, long]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: 360, border: "1px solid var(--border)" }} />
  );
}

export default function PoleDetail({ customer, project, poleId }: Props) {
  const searchParams = useSearchParams();
  const cust_qQuery = searchParams.get("cust_q");

  const backHref = cust_qQuery
    ? `/customers/${customer.id}/projects/${project.id}?cust_q=${encodeURIComponent(cust_qQuery)}`
    : `/customers/${customer.id}/projects/${project.id}`;

  const [device, setDevice] = useState<Partial<Device> | undefined>(undefined);
  const [statuses, setStatuses] = useState<Record<string, unknown> | undefined>(undefined);

  useEffect(() => {
    getDeviceData(poleId).then((data) => {
      setDevice(data);
      if (data?.poleNumber != null) {
      getDeviceStatuses(String(data.poleNumber)).then((statuses) => {
        setStatuses(statuses);
      });
    }
    });
  }, [poleId]);

  const isLoading = device === undefined;
  const poleName = device?.poleNumber != null ? `${device.poleNumber}` : poleId;
  const isOnline = device?.isOnline ?? false;
  const isWorking = device?.isWorking ?? 0;

  const lightRatio = typeof device?.lightRatio === "number"
  ? Math.round(device.lightRatio * 100) / 100
  : null;
  const panelPct  = device?.panelPercentage  != null ? Math.round(device.panelPercentage  * 100) / 100 : null;
  const batteryPct = device?.batteryPercentage != null ? Math.round(device.batteryPercentage * 100) / 100 : null;
  const pole_qQuery = searchParams.get("pole_q");
  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link href="/customers" className={styles.navLink}>
            <span className={styles.accent}>◈</span> CUSTOMERS
          </Link>
          {cust_qQuery && (
            <Link
              href={`/customers?q=${encodeURIComponent(cust_qQuery)}`}
              className={styles.crumbLink}
            >
              ← Customer Search: "{cust_qQuery}"
            </Link>
          )}
          <span className={styles.crumbSep}>›</span>
          <Link
            href={`/customers/${customer.id}${cust_qQuery ? `?cust_q=${encodeURIComponent(cust_qQuery)}` : ""}${pole_qQuery ? `${cust_qQuery ? "&" : "?"}pole_q=${encodeURIComponent(pole_qQuery)}` : ""}`}
            className={styles.crumbLink}
          >
            {customer.name}
          </Link>
          <span className={styles.crumbSep}>›</span>
          <Link
            href={`${backHref}${pole_qQuery ? `${backHref.includes("?") ? "&" : "?"}pole_q=${encodeURIComponent(pole_qQuery)}` : ""}`}
            className={styles.crumbLink}
          >
            {project.name}
          </Link>
          <span className={styles.crumbSep}>›</span>
          <span className={styles.crumbCurrent}>
            {isLoading ? "…" : poleName}
          </span>
        </div>
        <div className={styles.breadcrumb} style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          <Link href="/poles" className={styles.navLink}>
            <span className={styles.accent}>◈</span> POLES
          </Link>
          {pole_qQuery && (
            <>
              <Link
                href={`/poles?q=${encodeURIComponent(pole_qQuery)}`}
                className={styles.crumbLink}
              >
                ← Pole Search: "{pole_qQuery}"
              </Link>
            </>
        )}
        </div>
      </header>

      <div className={styles.body}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}>◉</div>
          <div className={styles.heroInfo}>
            <div className={styles.projectLabel}>{project.name}</div>
            <h1 className={styles.poleName}>{isLoading ? "…" : poleName}</h1>
            <div className={styles.heroMeta}>
              <span>Last update: <strong>{device?.lastStatusUpdate ?? "—"}</strong></span>
              <span>Install date: <strong>{device?.installDate ?? "—"}</strong></span>
            </div>
          </div>
          <div className={styles.heroCoords}>
            <div className={styles.coordRow}>
              <span className={styles.coordLabel}>LAT</span>
              <span className={styles.coordValue}>{device?.lat ?? "—"}</span>
            </div>
            <div className={styles.coordRow}>
              <span className={styles.coordLabel}>LONG</span>
              <span className={styles.coordValue}>{device?.long ?? "—"}</span>
            </div>
          </div>
          <span
            className={styles.statusBadge}
            style={{
              color: isLoading ? "var(--text-dim)" : isOnline ? "var(--green)" : "var(--red)",
              borderColor: isLoading ? undefined : isOnline ? undefined : "var(--red)",
              background: isLoading ? undefined : isOnline ? undefined : "var(--red-dim)",
            }}
          >
            ● {isLoading ? "…" : isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Status gauges */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>SYSTEM STATUS</div>
          <div className={styles.gaugeGrid}>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>PANEL STATUS</div>
              {isLoading || panelPct === null ? (
                <div className={styles.gaugeValue} style={{ color: "var(--text-dim)" }}>
                  {isLoading ? "…" : "—"}
                </div>
              ) : (
                <>
                  <div className={styles.gaugeValue} style={{ color: gaugeColor(panelPct) }}>{panelPct}%</div>
                  <StatusBar value={panelPct} color={gaugeColor(panelPct)} />
                </>
              )}
            </div>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>BATTERY STATUS</div>
              {isLoading || batteryPct === null ? (
                <div className={styles.gaugeValue} style={{ color: "var(--text-dim)" }}>
                  {isLoading ? "…" : "—"}
                </div>
              ) : (
                <>
                  <div className={styles.gaugeValue} style={{ color: gaugeColor(batteryPct) }}>{batteryPct}%</div>
                  <StatusBar value={batteryPct} color={gaugeColor(batteryPct)} />
                </>
              )}
            </div>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>LIGHT STATUS</div>
              {isLoading || lightRatio === null ? (
                <div className={styles.gaugeValue} style={{ color: "var(--text-dim)" }}>
                  {isLoading ? "…" : "—"}
                </div>
              ) : (
                <>
                  <div className={styles.gaugeValue} style={{ color: gaugeColor(lightRatio,isWorking) }}>{lightRatio}</div>
                  <StatusBar value={lightRatio} color={gaugeColor(lightRatio,isWorking)} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Battery Status */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>BATTERY STATUS</div>
          <div className={styles.gaugeGrid2}>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>BATTERY VOLTAGE 1</div>
              {isLoading || device?.batteryVoltage1 == null ? (
                <div className={styles.gaugeValue} style={{ color: "var(--text-dim)" }}>
                  {isLoading ? "…" : "—"}
                </div>
              ) : (
                <div className={styles.gaugeValue}>
                  {(Math.round((device.batteryVoltage1 as number) * 100) / 100).toFixed(2)}
                </div>
              )}
            </div>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeLabel}>BATTERY VOLTAGE 2</div>
              {isLoading || device?.batteryVoltage2 == null ? (
                <div className={styles.gaugeValue} style={{ color: "var(--text-dim)" }}>
                  {isLoading ? "…" : "—"}
                </div>
              ) : (
                <div className={styles.gaugeValue}>
                  {(Math.round((device.batteryVoltage2 as number) * 100) / 100).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Device Statuses */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>POLE STATUS</div>
          {statuses === undefined ? (
            <div className={styles.gaugeCard} style={{ color: "var(--text-dim)" }}>…</div>
          ) : Array.isArray(statuses) && statuses.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>The statuses are not available.</div>
          ) : (
            <PoleStatusChart statuses={Array.isArray(statuses) ? statuses as StatusRow[] : [statuses as StatusRow]} />
          )}
        </div>
        {/* Map */}
        {device?.lat != null && device?.long != null && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>LOCATION</div>
            {device.lat === 0 || device.long === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>The location map is not available.</div>
            ) : (
              <PoleMap lat={device.lat} long={device.long} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
