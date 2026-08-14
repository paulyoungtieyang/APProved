import { useAppState } from "@/lib/state/AppStateProvider";
import { Button } from "@/components/ui/Button";
import styles from "./steps.module.css";

export function ReviewSubmitStep({
  markets,
  languages,
  aiInstructions,
  submitted,
  onSubmit,
}: {
  markets: string[];
  languages: string[];
  aiInstructions: string;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const { project } = useAppState();
  const readyFiles = project.sourceFiles.filter((f) => f.status === "ready");

  if (submitted) {
    return (
      <div>
        <h3 className={styles.stepTitle}>Submission Complete</h3>
        <p className={styles.emptyState}>
          The submission for {project.deviceName} has been recorded. This is a mock confirmation
          — no submission was actually transmitted to any regulatory authority.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.stepTitle}>Review &amp; Submit</h3>
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
          <dt>Markets</dt>
          <dd>{markets.length > 0 ? markets.join(", ") : "None selected"}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Languages</dt>
          <dd>{languages.length > 0 ? languages.join(", ") : "None selected"}</dd>
        </div>
        <div className={styles.fact}>
          <dt>AI Instructions</dt>
          <dd>{aiInstructions.trim() ? aiInstructions.trim() : "None provided"}</dd>
        </div>
      </dl>
      <div className={styles.submitRow}>
        <Button type="button" onClick={onSubmit}>
          Confirm Submission
        </Button>
      </div>
    </div>
  );
}
