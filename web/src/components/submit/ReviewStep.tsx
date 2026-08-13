import { useAppState } from "@/lib/state/AppStateProvider";
import styles from "./steps.module.css";

export function ReviewStep() {
  const { project, frameworks } = useAppState();
  const selected = frameworks.filter((f) => project.selectedFrameworkIds.includes(f.id));
  const readyFiles = project.sourceFiles.filter((f) => f.status === "ready");

  return (
    <div>
      <h3 className={styles.stepTitle}>Review</h3>
      <dl className={styles.factList}>
        <div className={styles.fact}>
          <dt>Device / Product</dt>
          <dd>{project.deviceName}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Source Files Ready</dt>
          <dd>{readyFiles.length}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Regulatory Frameworks</dt>
          <dd>{selected.length > 0 ? selected.map((f) => f.authority).join(", ") : "None selected"}</dd>
        </div>
      </dl>
    </div>
  );
}
