import { StatusPill } from "@/components/ui/StatusPill";
import type { LibraryDocument } from "@/lib/state/types";
import styles from "./DocumentRow.module.css";

function formatSize(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function DocumentRow({ document }: { document: LibraryDocument }) {
  const date = new Date(document.updatedAt);
  // Fixed locale + UTC timezone -- see ActivityRow for why `undefined`
  // locale/timezone breaks SSR hydration.
  const updated = date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.title}>{document.title}</div>
        <div className={styles.subline}>
          {document.type} · {document.market} · {document.language}
        </div>
      </div>
      <div className={styles.meta}>
        <StatusPill status={document.status} />
        <span className={styles.updated}>{updated}</span>
        <span className={styles.size}>{formatSize(document.sizeBytes)}</span>
      </div>
    </div>
  );
}
