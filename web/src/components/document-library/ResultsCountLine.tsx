import styles from "./ResultsCountLine.module.css";

export function ResultsCountLine({ shown, total }: { shown: number; total: number }) {
  return (
    <p className={styles.line}>
      Showing {shown} of {total} documents
    </p>
  );
}
