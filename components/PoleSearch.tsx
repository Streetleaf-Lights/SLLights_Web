"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Device } from "@/lib/types";
import { getDeviceStatuses } from "@/lib/customers";
import styles from "./PoleSearch.module.css";
import poleStyles from "./PoleDetail.module.css";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

// ── Helpers ──────────────────────────────────────────────────────────────────

function gaugeColor(pct: number, isWorking?: number): string {
  if (isWorking === 2) return "var(--green)";
  if (isWorking === 0) return "var(--red)";
  if (pct >= 80) return "var(--green)";
  if (pct >= 50) return "var(--yellow)";
  return "var(--red)";
}

function StatusBar({ value, color }: { value: number; color: string }) {
  return (
    <div className={poleStyles.barWrap}>
      <div className={poleStyles.barTrack}>
        <div className={poleStyles.barFill} style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
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

    chartRef.current?.destroy();

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
            borderColor: "#1D9E75", borderWidth: 2, pointRadius: 3, tension: 0.35, fill: false,
          },
          {
            label: "Battery %",
            data: statuses.map((r) => Math.round(Number(r.currentBatteryPercentage ?? 0))),
            borderColor: "#378ADD", borderWidth: 2, pointRadius: 3, tension: 0.35, fill: false,
          },
          {
            label: "Light ratio",
            data: statuses.map((r) => Math.round(Number(r.currentLightRatio ?? 0))),
            borderColor: "#BA7517", borderWidth: 2, borderDash: [5, 4],
            pointRadius: 3, pointStyle: "triangle", tension: 0.35, fill: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
            borderWidth: 1, titleColor: tickColor, bodyColor: tickColor, padding: 10,
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 }, maxRotation: 30, autoSkip: true, maxTicksLimit: 10 },
            border: { color: gridColor },
          },
          y: {
            min: 0, max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 }, callback: (v: unknown) => v + "%" },
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
  }, [lat, long]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: 360, border: "1px solid var(--border)" }} />
  );
}
// ── Single pole panel ─────────────────────────────────────────────────────────

function SinglePolePanel({ device }: { device: Device }) {
  const [statuses, setStatuses] = useState<Record<string, unknown> | undefined>(undefined);

  // SinglePolePanel
useEffect(() => {
  if (device.poleNumber == null) return;

  getDeviceStatuses(String(device.poleNumber)).then((result) => {
    const isEmpty = Array.isArray(result)
      ? result.length === 0
      : Object.keys(result).length === 0;

    if (isEmpty && device.locationId != null) {
      return getDeviceStatuses(String(device.locationId));
    }
    return result;
  }).then(setStatuses);
}, [device.poleNumber, device.locationId]);

  const isOnline = device.isOnline;
  const isWorking = device.isWorking ?? 0;
  const panelPct = device.panelPercentage != null ? Math.round(device.panelPercentage * 100) / 100 : null;
  const batteryPct = device.batteryPercentage != null ? Math.round(device.batteryPercentage * 100) / 100 : null;
  const lightRatio = device.lightRatio != null ? Math.round(device.lightRatio * 100) / 100 : null;

  return (
    <div className={poleStyles.body} style={{ padding: 0 }}>
      {/* Hero */}
      <div className={poleStyles.hero}>
        <div className={poleStyles.heroIcon}>◉</div>
        <div className={poleStyles.heroInfo}>
          <h1 className={poleStyles.poleName}>{device.poleNumber}</h1>
          <div className={poleStyles.heroMeta}>
            {device.lastStatusUpdate && <span>Last update: <strong>{device.lastStatusUpdate}</strong></span>}
            {device.installDate && <span>Install date: <strong>{device.installDate}</strong></span>}
          </div>
        </div>
        <div className={poleStyles.heroCoords}>
          <div className={poleStyles.coordRow}>
            <span className={poleStyles.coordLabel}>LAT</span>
            <span className={poleStyles.coordValue}>{device.lat ?? "—"}</span>
          </div>
          <div className={poleStyles.coordRow}>
            <span className={poleStyles.coordLabel}>LONG</span>
            <span className={poleStyles.coordValue}>{device.long ?? "—"}</span>
          </div>
        </div>
        <span
          className={poleStyles.statusBadge}
          style={{
            color: isOnline ? "var(--green)" : "var(--red)",
            borderColor: isOnline ? undefined : "var(--red)",
            background: isOnline ? undefined : "var(--red-dim)",
          }}
        >
          ● {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* System status */}
      <div className={poleStyles.section}>
        <div className={poleStyles.sectionLabel}>SYSTEM STATUS</div>
        <div className={poleStyles.gaugeGrid}>
          <div className={poleStyles.gaugeCard}>
            <div className={poleStyles.gaugeLabel}>PANEL STATUS</div>
            {panelPct === null ? (
              <div className={poleStyles.gaugeValue} style={{ color: "var(--text-dim)" }}>—</div>
            ) : (
              <>
                <div className={poleStyles.gaugeValue} style={{ color: gaugeColor(panelPct) }}>{panelPct}%</div>
                <StatusBar value={panelPct} color={gaugeColor(panelPct)} />
              </>
            )}
          </div>
          <div className={poleStyles.gaugeCard}>
            <div className={poleStyles.gaugeLabel}>BATTERY STATUS</div>
            {batteryPct === null ? (
              <div className={poleStyles.gaugeValue} style={{ color: "var(--text-dim)" }}>—</div>
            ) : (
              <>
                <div className={poleStyles.gaugeValue} style={{ color: gaugeColor(batteryPct) }}>{batteryPct}%</div>
                <StatusBar value={batteryPct} color={gaugeColor(batteryPct)} />
              </>
            )}
          </div>
          <div className={poleStyles.gaugeCard}>
            <div className={poleStyles.gaugeLabel}>LIGHT STATUS</div>
            {lightRatio === null ? (
              <div className={poleStyles.gaugeValue} style={{ color: "var(--text-dim)" }}>—</div>
            ) : (
              <>
                <div className={poleStyles.gaugeValue} style={{ color: gaugeColor(lightRatio, isWorking) }}>{lightRatio}</div>
                <StatusBar value={lightRatio} color={gaugeColor(lightRatio, isWorking)} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Battery voltages */}
      <div className={poleStyles.section}>
        <div className={poleStyles.sectionLabel}>BATTERY STATUS</div>
        <div className={poleStyles.gaugeGrid2}>
          <div className={poleStyles.gaugeCard}>
            <div className={poleStyles.gaugeLabel}>BATTERY VOLTAGE 1</div>
            {device.batteryVoltage1 == null ? (
              <div className={poleStyles.gaugeValue} style={{ color: "var(--text-dim)" }}>—</div>
            ) : (
              <div className={poleStyles.gaugeValue}>
                {(Math.round((device.batteryVoltage1 as number) * 100) / 100).toFixed(2)}
              </div>
            )}
          </div>
          <div className={poleStyles.gaugeCard}>
            <div className={poleStyles.gaugeLabel}>BATTERY VOLTAGE 2</div>
            {device.batteryVoltage2 == null ? (
              <div className={poleStyles.gaugeValue} style={{ color: "var(--text-dim)" }}>—</div>
            ) : (
              <div className={poleStyles.gaugeValue}>
                {(Math.round((device.batteryVoltage2 as number) * 100) / 100).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={poleStyles.section}>
        <div className={poleStyles.sectionLabel}>POLE STATUS</div>
        {statuses === undefined ? (
          <div className={poleStyles.gaugeCard} style={{ color: "var(--text-dim)" }}>…</div>
        ) : Array.isArray(statuses) && statuses.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>The statuses are not available.</div>
        ) : (
          <PoleStatusChart statuses={Array.isArray(statuses) ? statuses as StatusRow[] : [statuses as StatusRow]} />
        )}
      </div>
      {/* Map */}
      {device.lat != null && device.long != null && (
        <div className={poleStyles.section}>
          <div className={poleStyles.sectionLabel}>LOCATION</div>
          {device.lat === 0 || device.long === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>The location map is not available.</div>
          ) : (
            <PoleMap lat={device.lat} long={device.long} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Multi-pole panel ──────────────────────────────────────────────────────────

function PoleCard({ device, committedQuery }: { device: Device; committedQuery: string }) {
  const isOnline = device.isOnline;
  const isWorking = device.isWorking;
  const panelPct = device.panelPercentage != null ? Math.round(device.panelPercentage * 100) / 100 : null;
  const batteryPct = device.batteryPercentage != null ? Math.round(device.batteryPercentage * 100) / 100 : null;
  const lightRatio = device.lightRatio != null ? Math.round(device.lightRatio * 100) / 100 : null;
  const poleHref = device.customerId && device.projectId
    ? `/customers/${device.customerId}/projects/${device.projectId}/poles/${device.id}?pole_q=${encodeURIComponent(committedQuery)}`
    : undefined;
  return (
    <div className={styles.poleCard}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div className={styles.poleHeader}>
          <span className={styles.poleDot} style={{ background: isOnline ? "var(--green)" : "var(--red)" }} />
          <span className={styles.poleName}>
            {poleHref ? (
              <Link href={poleHref} className={styles.poleNameLink}>
                {device.poleNumber}
              </Link>
            ) : (
              <span className={styles.poleName}>{device.poleNumber}</span>
            )}
          </span>
          <span className={styles.badge} style={{
            color: isOnline ? "var(--green)" : "var(--red)",
            borderColor: isOnline ? "var(--green)" : "var(--red)",
          }}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
        <div className={styles.poleMeta}>
          {device.installDate && <span>Installed: <b>{device.installDate}</b></span>}
          {device.lastStatusUpdate && <span>Last update: <b>{device.lastStatusUpdate}</b></span>}
          {device.lat != null && device.long != null && <span>{device.lat}, {device.long}</span>}
        </div>
      </div>
      <div className={styles.poleStats}>
        <div className={styles.poleStat}>
          <span className={styles.poleStatN} style={{ color: panelPct != null ? (panelPct >= 50 ? "var(--green)" : "var(--red)") : undefined }}>
            {panelPct != null ? `${panelPct}%` : "—"}
          </span>
          <span className={styles.poleStatL}>PANEL</span>
        </div>
        <div className={styles.poleStat}>
          <span className={styles.poleStatN} style={{ color: batteryPct != null ? (batteryPct >= 50 ? "var(--green)" : "var(--red)") : undefined }}>
            {batteryPct != null ? `${batteryPct}%` : "—"}
          </span>
          <span className={styles.poleStatL}>BATTERY</span>
        </div>
        <div className={styles.poleStat}>
          <span className={styles.poleStatN} style={{ color: isWorking === 2 ? "var(--green)" : isWorking === 0 ? "var(--red)" : "var(--yellow)" }}>
            {lightRatio != null ? lightRatio : "—"}
          </span>
          <span className={styles.poleStatL}>LIGHT RATIO</span>
        </div>
      </div>
    </div>
  );
}

function MultiplePolePanel({ devices, committedQuery }: { devices: Device[]; committedQuery: string }) {
  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>{devices.length} POLES FOUND</div>
        <div className={styles.poleGrid}>
          {devices.map((device) => (
            <PoleCard key={device.id} device={device} committedQuery={committedQuery} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PoleSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [devices, setDevices] = useState<Device[] | undefined>(undefined);
  const [inputValue, setInputValue] = useState(() => searchParams.get("q") ?? "");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch("/api/azure/devices")
      .then((res) => res.json())
      .then((data) => setDevices(data))
      .catch(() => setDevices([]));
  }, []);

  useEffect(() => {
    if (!searchParams.has("q")) setInputValue("");
  }, [searchParams]);

  const committedQuery = searchParams.get("q") ?? "";
  const submitted = searchParams.has("q");

  useEffect(() => {
    setIsSearching(false);
  }, [committedQuery]);

  const matches = submitted && committedQuery.trim().length >= 3 && devices
    ? devices.filter((d) =>
        String(d.poleNumber).toLowerCase().includes(committedQuery.trim().toLowerCase())
      )
    : [];

  function commitSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    setIsSearching(true);
    commitSearch(value);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commitSearch(inputValue);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link href="/customers" className={styles.navLink}>
            <span className={styles.accent}>◈</span> CUSTOMERS
          </Link>
        </div>
        <div className={styles.breadcrumb} style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          <Link href="/poles" className={styles.navLink}>
            <span className={styles.accent}>◈</span> POLES
          </Link>
        </div>
      </header>

      <div className={styles.main}>
        <div className={styles.dropdownRow}>
          <label className={styles.dropdownLabel}>SEARCH POLE</label>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div className={styles.selectWrap} style={{ flex: 1 }}>
              <input
                name="q"
                className={styles.select}
                type="text"
                placeholder="Enter pole number…"
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

        {devices === undefined ? (
          <div className={styles.empty}>Loading…</div>
        ) : submitted && committedQuery.trim() && (
          isSearching
            ? <div className={styles.empty}>Searching…</div>
            : committedQuery.trim().length < 3
              ? <div className={styles.empty}>Enter at least 3 characters to search.</div>
              : matches.length === 0
                ? <div className={styles.empty}>No matching poles found. Please try a different search.</div>
                : matches.length === 1
                  ? <SinglePolePanel device={matches[0]} />
                  : <MultiplePolePanel devices={matches} committedQuery={committedQuery} />
        )}
      </div>
    </div>
  );
}
