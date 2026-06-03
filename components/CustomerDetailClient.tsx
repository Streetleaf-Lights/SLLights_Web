"use client";

import Link from "next/link";
import type { Customer, Project, ContactInfo } from "@/lib/types";
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

function ProjectCard({ project, customerId }: { project: Project; customerId: string }) {
  const color = STATUS_COLOR[project.status] ?? "var(--text-dim)";
  return (
    <div className={styles.projectCard}>
      <div className={styles.projectHeader}>
        <span className={styles.projectDot} style={{ background: color }} />
        <Link
          href={`/customers/${customerId}/projects/${project.id}`}
          className={styles.projectNameLink}
        >
          {project.name}
        </Link>
        <span className={styles.projectBadge} style={{ color, borderColor: color }}>
          {project.status.replace("_", " ")}
        </span>
      </div>
      {project.description && (
        <p className={styles.projectDesc}>{project.description}</p>
      )}
      <div className={styles.projectMeta}>
        {project.lead && <span>Lead: <span className={styles.highlight}>{project.lead}</span></span>}
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
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={styles.contactLink}>
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className={styles.contactLink}>
              {contact.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailClient({ customer }: { customer: Customer }) {
  const activeCount = customer.projects.filter(
    (p) => p.status === "active" || p.status === "at_risk"
  ).length;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <Link href="/customers" className={styles.back}>← All customers</Link>
        <div className={styles.topbarRight}>
          {customer.tier && (
            <span className={styles.tierBadge} style={{ color: TIER_COLOR[customer.tier] ?? "var(--text-muted)", borderColor: TIER_COLOR[customer.tier] ?? "var(--border)" }}>
              {customer.tier.toUpperCase()}
            </span>
          )}
        </div>
      </header>

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
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Summary table */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>SUMMARY</div>
          <div className={styles.summaryTable}>
            <div className={styles.summaryCol}>
              <div className={styles.summaryValue}>4</div>
              <div className={styles.summaryLabel}>TOTAL LIGHTS</div>
            </div>
            <div className={styles.summaryCol} style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
              <div className={styles.summaryValue} style={{ color: "var(--green)" }}>100%</div>
              <div className={styles.summaryLabel}>LIGHTS WORKING</div>
            </div>
            <div className={styles.summaryCol}>
              <div className={styles.summaryValue}>0</div>
              <div className={styles.summaryLabel}>TOTAL FAULTS</div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>PROJECTS</div>
          {customer.projects.length === 0 ? (
            <div className={styles.empty}>No projects on record.</div>
          ) : (
            <div className={styles.projectGrid}>
              {customer.projects.map((p) => (
                <ProjectCard key={p.id} project={p} customerId={customer.id} />
              ))}
            </div>
          )}
        </section>

        {/* Contacts */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>CONTACTS</div>
          {customer.contacts.length === 0 ? (
            <div className={styles.empty}>No contacts on record.</div>
          ) : (
            <div className={styles.contactGrid}>
              {customer.contacts.map((c, i) => (
                <ContactCard key={i} contact={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
