"use client";

import { useAppState } from "@/lib/state/AppStateProvider";
import styles from "./TopBar.module.css";

export function TopBar() {
  const { organization } = useAppState();
  const initials = organization.currentUser.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <header className={styles.topbar}>
      <div className={styles.orgName}>{organization.name}</div>
      <div className={styles.identity} title={organization.currentUser.role}>
        <span className={styles.avatar}>{initials}</span>
        <span className={styles.identityText}>
          <span className={styles.name}>{organization.currentUser.name}</span>
          <span className={styles.role}>{organization.currentUser.role}</span>
        </span>
      </div>
    </header>
  );
}
