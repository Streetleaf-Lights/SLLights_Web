"use client";

import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import { UserRole, UserStatus } from "@/lib/types";
import { postUser, deleteUser } from "@/lib/customers";
import styles from "./UserList.module.css";

const STATUS_COLOR: Record<UserStatus, string> = {
  [UserStatus.Active]:  "var(--green)",
  [UserStatus.Pending]: "var(--yellow)",
  [UserStatus.Inactive]:"var(--text-dim)",
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: UserRole.SLAdmin });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

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

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(undefined);
    const result = await postUser(form.name, form.email, form.role);
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
                      <td>{user.role}</td>
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
              <div className={styles.field}>
                <label className={styles.fieldLabel}>EMAIL</label>
                <input
                  className={styles.fieldInput}
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>NAME</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>ROLE</label>
                <select
                  className={styles.fieldInput}
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                >
                  {Object.values(UserRole).map((r) => (
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
