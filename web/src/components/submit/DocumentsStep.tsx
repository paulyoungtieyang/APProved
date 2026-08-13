import { useAppState } from "@/lib/state/AppStateProvider";
import { StatusPill } from "@/components/ui/StatusPill";
import styles from "./steps.module.css";

export function DocumentsStep() {
  const { project } = useAppState();
  const readyFiles = project.sourceFiles.filter((f) => f.status === "ready");

  return (
    <div>
      <h3 className={styles.stepTitle}>Documents</h3>
      {readyFiles.length === 0 ? (
        <p className={styles.emptyState}>
          No source data has been uploaded yet. You can still proceed, but the submission will
          be flagged as incomplete.
        </p>
      ) : (
        <ul className={styles.list}>
          {readyFiles.map((f) => (
            <li key={f.id} className={styles.listRow}>
              <span>{f.name}</span>
              <StatusPill status={f.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
