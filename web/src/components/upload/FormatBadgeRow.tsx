import styles from "./FormatBadgeRow.module.css";

const FORMATS = ["CSV", "XLSX", "PDF", "DOCX"];

export function FormatBadgeRow() {
  return (
    <div className={styles.row}>
      {FORMATS.map((f) => (
        <span key={f} className={styles.badge}>
          {f}
        </span>
      ))}
    </div>
  );
}
