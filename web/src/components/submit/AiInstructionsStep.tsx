import styles from "./steps.module.css";
import instructionStyles from "./AiInstructionsStep.module.css";

export function AiInstructionsStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h3 className={styles.stepTitle}>AI Instructions</h3>
      <p className={styles.emptyState}>
        Optional generation parameters — tone, emphasis, or specific requirements the AI should
        follow when drafting this submission's documents.
      </p>
      <textarea
        className={instructionStyles.textarea}
        rows={6}
        placeholder="e.g. Emphasize long-term safety data. Use British English for EU markets. Keep the executive summary under 200 words."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
