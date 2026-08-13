import { StatusPill } from "@/components/ui/StatusPill";
import type { ActivityEntry } from "@/lib/state/types";
import styles from "./ActivityRow.module.css";

export function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const date = new Date(entry.timestamp);
  // Fixed locale + UTC timezone -- toLocaleString(undefined, ...) would use
  // the server's locale/timezone for the SSR pass and the browser's for
  // hydration, and any mismatch between them breaks hydration.
  const when = date.toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={styles.row}>
      <span className={styles.label}>{entry.label}</span>
      <span className={styles.meta}>
        <StatusPill status={entry.status} />
        <span className={styles.time}>{when}</span>
      </span>
    </div>
  );
}
