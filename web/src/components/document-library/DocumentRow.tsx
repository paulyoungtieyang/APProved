import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { downloadMockFile } from "@/lib/download-mock-file";
import type { LibraryDocument } from "@/lib/state/types";
import styles from "./DocumentRow.module.css";

function formatSize(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function downloadDocument(document: LibraryDocument) {
  const content = `${document.title}\n\nType: ${document.type}\nMarket: ${document.market}\nLanguage: ${document.language}\nStatus: ${document.status}\n\nThis is a placeholder file for a prototype -- no real document was generated for this library entry.`;
  downloadMockFile(`${document.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`, content);
}

export function DocumentRow({
  document,
  onPreview,
}: {
  document: LibraryDocument;
  onPreview: (document: LibraryDocument) => void;
}) {
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
        <div className={styles.badges}>
          <span className={styles.tag}>{document.type}</span>
          <span className={styles.tag}>{document.market}</span>
          <span className={styles.tagMuted}>{document.language}</span>
          <StatusPill status={document.status} />
        </div>
        <div className={styles.subline}>
          {updated} · {formatSize(document.sizeBytes)}
        </div>
      </div>
      <div className={styles.actions}>
        <Button type="button" onClick={() => downloadDocument(document)} className={styles.actionBtn}>
          ↓ Download
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPreview(document)}
          className={styles.actionBtn}
        >
          Preview
        </Button>
      </div>
    </div>
  );
}
