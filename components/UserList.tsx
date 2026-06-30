"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { UserRole, UserStatus } from "@/lib/types";
import { postUser, deleteUser, getCustomers } from "@/lib/customers";
import styles from "./UserList.module.css";
import type { Customer } from "@/lib/types";

const STATUS_COLOR: Record<UserStatus, string> = {
  [UserStatus.Active]:  "var(--green)",
  [UserStatus.Pending]: "var(--yellow)",
  [UserStatus.Inactive]:"var(--text-dim)",
};

export default function UserList({ sessionRole }: { sessionRole: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: UserRole.SLAdmin });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  const [customerSearch, setCustomerSearch] = useState("Streetleaf");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDropdown, setShowDropdown] = useState(true);

  // const displayRole = (role: string) =>
  //   session?.role === "Customer Admin" && role === "Customer Admin" ? "Admin" : role;

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const isStreetleaf = !selectedCustomer || selectedCustomer.name.trim() === "Streetleaf";

  const roleOptions = isStreetleaf
    ? [UserRole.SLAdmin, UserRole.User]
    : [UserRole.CustomerAdmin, UserRole.User];

  useEffect(() => {
    if (!modalOpen) return;
    setCustomersLoading(true);
    fetch("/api/azure/customers")
    .then(r => r.json())
    .then(data => {
      const raw = Array.isArray(data) ? data : data?.value ?? [];
      setCustomers(raw.map((c: any) => ({
        id: c.ID ?? c.id ?? "",
        name: c.Name ?? c.name ?? "",
      })))
    })
    .catch(() => setCustomers([]))
    .finally(() => setCustomersLoading(false));
  }, [modalOpen]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/azure/users");
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data?.value ?? [];
      setUsers(raw.map((u: any) => ({
        id: u.ID ?? u.id ?? "",
        name: u.Name ?? u.name ?? "",
        email: u.Email ?? u.email ?? "",
        role: u.Role ?? u.role ?? "",
        password: u.Password ?? u.password ?? "",
        status: u.Status ?? u.status ?? "",
        customerId: u.CustomerId ?? u.customerId ?? "",
        customerName: u.CustomerName ?? u.customerName ?? "",
      })));
    } catch (e) {
      console.error("fetchUsers error:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteUser(id);
    if (result.success) {
      await fetchUsers();
    } else {
      console.error("deleteUser error:", result.error);
    }
    setDeletingId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(undefined);
    const emailErr = !form.email
      ? "Email is required."
      : !EMAIL_REGEX.test(form.email)
      ? "Please enter a valid email address."
      : null;
    const nameErr = !form.name.trim() ? "Name is required." : null;
    const customerErr = !selectedCustomer ? "Please select a customer." : null;
    setEmailError(emailErr);
    setNameError(nameErr);
    setCustomerError(customerErr);
    if (emailErr || nameErr || customerErr) { setSubmitting(false); return; }
    const result = await postUser(
      form.name, form.email, form.role,
      selectedCustomer?.id,
      selectedCustomer?.name,
    );
    setSubmitting(false);
    if (result.success) {
      console.log("Created user id:", result.id); // verify matches email token
      setModalOpen(false);
      setForm({ email: "", name: "", role: UserRole.SLAdmin });
      await fetchUsers();
    } else {
      setSubmitError(result.error);
    }
  }

  function handleCancel() {
    setModalOpen(false);
    setForm({ email: "", name: "", role: UserRole.SLAdmin });
    setSubmitError(undefined);
    setEmailError(null);
    setNameError(null);
    setCustomerSearch("Streetleaf");
    setSelectedCustomer(null);
    setShowDropdown(true);
    setCustomerError(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <span className={styles.navText}>
            <span className={styles.accent}>◈</span> USERS
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              {loading ? "…" : `${users.length} USERS`}
            </div>
            <button className={styles.addButton} onClick={() => setModalOpen(true)}>
              + ADD USER
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>CUSTOMER</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className={styles.empty}>…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>No users found.</td></tr>
                ) : (
                  users.map((user, i) => (
                    <tr key={i}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{sessionRole === "Customer Admin" && user.role === "Customer Admin" ? "Admin" : user.role}</td>
                      <td>{user.customerName || "—"}</td>
                      <td>
                        <span style={{ color: STATUS_COLOR[user.status] ?? "var(--text-dim)" }}>
                          ● {user.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.deleteButton}
                          onClick={() => { setConfirmDeleteId(user.id); setConfirmDeleteName(user.name); }}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? "…" : "DELETE"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={handleCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.sectionLabel}>ADD USER</span>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field} style={{ position: "relative" }}>
                <label className={styles.fieldLabel}>CUSTOMER</label>
                {selectedCustomer && (
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Selected: </span>
                    <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>{selectedCustomer.name}</span>
                  </div>
                )}
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="Search customer…"
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 150);
                    if (!selectedCustomer) setCustomerError("Please select a customer.");
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {customerError && (
                  <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {customerError}
                  </span>
                )}
                {showDropdown && customerSearch && (
                  <div style={dropdownStyle}>
                    {customersLoading ? (
                      <div style={dropdownItemStyle}>…</div>
                    ) : filtered.length === 0 ? (
                      <div style={dropdownItemStyle}>No customers found.</div>
                    ) : (
                      filtered.map(c => (
                        <div
                          key={c.id}
                          style={dropdownItemStyle}
                          onMouseDown={() => {
                            setSelectedCustomer(c);
                            setCustomerSearch(c.name);
                            setShowDropdown(false);
                            setCustomerError(null);
                            setForm(f => ({
                              ...f,
                              role: c.name.trim() === "Streetleaf" ? UserRole.SLAdmin : UserRole.CustomerAdmin,
                            }));
                          }}
                        >
                          {c.name}
                        </div>      
                      ))
                    )}
                  </div>  
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>EMAIL</label>
                <input
                  className={styles.fieldInput}
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((f) => ({ ...f, email: val }));
                    setEmailError(val && !EMAIL_REGEX.test(val) ? "Please enter a valid email address." : null);
                  }}
                  onKeyDown={handleKeyDown}
                />
                {emailError && (
                  <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    {emailError}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>NAME</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((f) => ({ ...f, name: val }));
                    setNameError(!val.trim() ? "Name is required." : null);
                  }}
                  onKeyDown={handleKeyDown}
                />
                {nameError && (
                  <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  {nameError}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>ROLE</label>
                <select
                  className={styles.fieldInput}
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {submitError && (
                <span className={styles.submitError}>{submitError}</span>
              )}
              <button className={styles.cancelButton} onClick={handleCancel} disabled={submitting}>
                CANCEL
              </button>
              <button className={styles.submitButton} onClick={handleSubmit} disabled={submitting}>
                {submitting ? "SUBMITTING…" : "SUBMIT"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      {confirmDeleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === "Enter") { handleDelete(confirmDeleteId!); setConfirmDeleteId(null); } }}
            tabIndex={-1}
            ref={el => el?.focus()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.sectionLabel}>DELETE USER</span>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, color: "var(--text)" }}>
                Are you sure you want to delete <strong>{confirmDeleteName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setConfirmDeleteId(null)}>
                CANCEL
              </button>
              <button
                className={styles.deleteButton}
                disabled={deletingId === confirmDeleteId}
                onClick={async () => {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                {deletingId === confirmDeleteId ? "…" : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  zIndex: 10,
  maxHeight: "180px",
  overflowY: "auto",
};

const dropdownItemStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: "13px",
  cursor: "pointer",
  color: "var(--text)",
};
