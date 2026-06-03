"use client";

import { useState } from "react";
import Link from "next/link";
import type { Customer, Project, ContactInfo } from "@/lib/types";
import styles from "./CustomerList.module.css";

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

function ProjectCard({ project, customerId }: { project: Project; customerId: string }) {
  const color = STATUS_COLOR[project.status] ?? "var(--text-dim)";
  return (
    <div className={styles.projectCard}>
      <div className={styles.projectHeader}>
        <span className={styles.dot} style={{ background: color }} />
        <Link
          href={`/customers/${customerId}/projects/${project.id}`}
          className={styles.projectNameLink}
        >
          {project.name}
        </Link>
        <span className={styles.badge} style={{ color, borderColor: color }}>
          {project.status.replace("_", " ")}
        </span>
      </div>
      {project.description && <p className={styles.projectDesc}>{project.description}</p>}
      <div className={styles.projectMeta}>
        {project.lead && <span>Lead: <b>{project.lead}</b></span>}
        {project.startDate && <span>Start: {project.startDate}</span>}
        {project.endDate && <span>End: {project.endDate}</span>}
      </div>
      <div className={styles.projectStats}>
        <div className={styles.projectStat}>
          <span className={styles.projectStatN}>2</span>
          <span className={styles.projectStatL}>TOTAL LIGHTS</span>
        </div>
        <div className={styles.projectStat}>
          <span className={styles.projectStatN} style={{ color: "var(--green)" }}>100%</span>
          <span className={styles.projectStatL}>LIGHTS WORKING</span>
        </div>
        <div className={styles.projectStat}>
          <span className={styles.projectStatN}>0</span>
          <span className={styles.projectStatL}>TOTAL FAULTS</span>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ contact }: { contact: ContactInfo }) {
  return (
    <div className={styles.contactCard}>
      <div className={styles.contactAvatar}>
        {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div className={styles.contactInfo}>
        <div className={styles.contactName}>{contact.name}</div>
        {contact.role && <div className={styles.contactRole}>{contact.role}</div>}
        <div className={styles.contactLinks}>
          {contact.email && <a href={`mailto:${contact.email}`} className={styles.link}>{contact.email}</a>}
          {contact.phone && <a href={`tel:${contact.phone}`} className={styles.link}>{contact.phone}</a>}
        </div>
      </div>
    </div>
  );
}

function CustomerPanel({ customer }: { customer: Customer }) {
  const activeCount = customer.projects.filter(
    (p) => p.status === "active" || p.status === "at_risk"
  ).length;

  const fullAddress = [
    customer.customerAddress,
    customer.customerCity,
    customer.customerState,
    customer.customerZip,
  ].filter(Boolean);

  return (
    <div className={styles.panel}>
      {/* Customer hero */}
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
          <div className={styles.heroStat}>
            <span className={styles.heroStatN} style={{ color: activeCount > 0 ? "var(--green)" : "var(--text-dim)" }}>
              {activeCount}
            </span>
            <span className={styles.heroStatL}>ACTIVE</span>
          </div>
        </div>
        {customer.tier && (
          <span className={styles.tierBadge} style={{
            color: TIER_COLOR[customer.tier] ?? "var(--text-muted)",
            borderColor: TIER_COLOR[customer.tier] ?? "var(--border)"
          }}>
            {customer.tier.toUpperCase()}
          </span>
        )}
      </div>

      {/* Summary table */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>SUMMARY</div>
        <div className={styles.summaryTable}>
          <div className={styles.summaryCol}>
            <div className={styles.summaryValue}>4</div>
            <div className={styles.summaryLabel}>TOTAL LIGHTS</div>
          </div>
          <div className={styles.summarySep} />
          <div className={styles.summaryCol}>
            <div className={styles.summaryValue} style={{ color: "var(--green)" }}>100%</div>
            <div className={styles.summaryLabel}>LIGHTS WORKING</div>
          </div>
          <div className={styles.summarySep} />
          <div className={styles.summaryCol}>
            <div className={styles.summaryValue}>0</div>
            <div className={styles.summaryLabel}>TOTAL FAULTS</div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>PROJECTS</div>
        {customer.projects.length === 0
          ? <div className={styles.empty}>No projects on record.</div>
          : <div className={styles.projectGrid}>
              {customer.projects.map((p) => <ProjectCard key={p.id} project={p} customerId={customer.id} />)}
            </div>
        }
      </div>

      {/* Contacts */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>CONTACTS</div>
        {customer.contacts.length === 0
          ? <div className={styles.empty}>No contacts on record.</div>
          : <div className={styles.contactGrid}>
              {customer.contacts.map((c, i) => <ContactCard key={i} contact={c} />)}
            </div>
        }
      </div>
    </div>
  );
}

export default function CustomerListClient({ customers }: { customers: Customer[] }) {
  const [selectedId, setSelectedId] = useState<string>(customers[0]?.id ?? "");
  const selected = customers.find((c) => c.id === selectedId) ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}><span className={styles.accent}>◈</span> CUSTOMERS</div>
      </header>

      <div className={styles.main}>
        {customers.length === 0 ? (
          <div className={styles.empty}>
            No data — check <code>AZURE_APIM_BASE_URL</code> and <code>AZURE_APIM_SUBSCRIPTION_KEY</code> in .env.local
          </div>
        ) : (
          <>
            <div className={styles.dropdownRow}>
              <label className={styles.dropdownLabel}>SELECT CUSTOMER</label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span className={styles.selectArrow}>▾</span>
              </div>
            </div>

            {selected && <CustomerPanel customer={selected} />}
          </>
        )}
      </div>
    </div>
  );
}
