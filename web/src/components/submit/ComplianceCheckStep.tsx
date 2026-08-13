import styles from "./steps.module.css";

const CHECKS = [
  "Document formatting matches regulatory template",
  "Required signatures and approvals present",
  "No unresolved reviewer comments",
  "Audit trail complete for all included documents",
];

export function ComplianceCheckStep() {
  return (
    <div>
      <h3 className={styles.stepTitle}>Compliance Check</h3>
      <ul className={styles.list}>
        {CHECKS.map((check) => (
          <li key={check} className={styles.listRow}>
            <span>{check}</span>
            <span aria-label="Passed" className={styles.passed}>
              ✓ Passed
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
