import styles from "./StatusPill.module.css";

type PillTone = "neutral" | "good" | "bad" | "decision" | "accent";

const STATUS_TONE: Record<string, PillTone> = {
  uploading: "accent",
  processing: "decision",
  ready: "good",
  error: "bad",
  "In Progress": "decision",
  "Pending Review": "accent",
  Completed: "good",
  Final: "good",
};

export function StatusPill({
  status,
  tone,
}: {
  status: string;
  tone?: PillTone;
}) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  return <span className={`${styles.pill} ${styles[resolved]}`}>{status}</span>;
}
