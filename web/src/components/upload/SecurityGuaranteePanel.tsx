import styles from "./SecurityGuaranteePanel.module.css";

const GUARANTEES = [
  "Processed in a closed-loop environment",
  "Never used to train any model",
  "Encrypted in transit and at rest",
  "Access limited to your organization's team",
];

export function SecurityGuaranteePanel() {
  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Data Security</div>
      <ul className={styles.list}>
        {GUARANTEES.map((g) => (
          <li key={g} className={styles.item}>
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
            {g}
          </li>
        ))}
      </ul>
    </div>
  );
}
