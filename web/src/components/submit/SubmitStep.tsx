import { useAppState } from "@/lib/state/AppStateProvider";
import { Button } from "@/components/ui/Button";
import styles from "./steps.module.css";

export function SubmitStep({
  submitted,
  onSubmit,
}: {
  submitted: boolean;
  onSubmit: () => void;
}) {
  const { project } = useAppState();

  if (submitted) {
    return (
      <div>
        <h3 className={styles.stepTitle}>Submission Complete</h3>
        <p className={styles.emptyState}>
          The submission for {project.deviceName} has been recorded. This is a mock
          confirmation — no submission was actually transmitted to any regulatory authority.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.stepTitle}>Submit</h3>
      <p className={styles.emptyState}>
        Review is complete. Submitting will finalize this package for {project.deviceName}.
      </p>
      <Button type="button" onClick={onSubmit}>
        Confirm Submission
      </Button>
    </div>
  );
}
