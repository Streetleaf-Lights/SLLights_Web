"use client";

import type { User } from "@/lib/types";
import { UserRole, UserStatus } from "@/lib/types";
import styles from "./UserList.module.css";

const STATUS_COLOR: Record<UserStatus, string> = {
  [UserStatus.Active]:   "var(--green)",
  [UserStatus.Pending]:  "var(--yellow)",
  [UserStatus.Inactive]: "var(--text-dim)",
};

export default function UserList({ users }: { users: User[] }) {
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
          <div className={styles.sectionLabel}>{users.length} USERS</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>CUSTOMER</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.empty}>No users found.</td>
                  </tr>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
