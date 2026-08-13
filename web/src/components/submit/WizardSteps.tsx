import { WIZARD_STEPS } from "@/lib/submit-wizard-steps";
import styles from "./WizardSteps.module.css";

export function WizardSteps({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className={styles.list}>
      {WIZARD_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.id} className={styles.item}>
            <span
              className={`${styles.dot} ${done ? styles.done : ""} ${active ? styles.active : ""}`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={`${styles.label} ${active ? styles.activeLabel : ""}`}>
              {step.label}
            </span>
            {i < WIZARD_STEPS.length - 1 && <span className={styles.connector} />}
          </li>
        );
      })}
    </ol>
  );
}
