import styles from "./ComplianceFrameworkNotice.module.css";

export function ComplianceFrameworkNotice() {
  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Medical & Scientific Text Governance</div>
      <p className={styles.body}>
        Medical Science Liaisons have read-only access across the platform and cannot modify
        approved medical or scientific text blocks. Any proposed change to that content must be
        submitted for review and requires sign-off from a Compliance Officer before it can go
        final.
      </p>
    </div>
  );
}
