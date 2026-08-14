import { Button } from "@/components/ui/Button";
import { downloadMockFile } from "@/lib/download-mock-file";
import styles from "./DownloadableDocRow.module.css";

export function DownloadableDocRow({
  title,
  description,
  tags,
  onDownload,
}: {
  title: string;
  description?: string;
  tags: string[];
  onDownload: () => void;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.desc}>{description}</div>}
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Button type="button" onClick={onDownload} className={styles.downloadBtn}>
        ↓ Download
      </Button>
    </div>
  );
}

export function mockDownload(title: string) {
  const content = `${title}\n\nThis is a placeholder file for a prototype -- no real document is stored behind this download.`;
  downloadMockFile(`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`, content);
}
