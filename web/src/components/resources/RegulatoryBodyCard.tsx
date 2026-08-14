import type { RegulatoryBody } from "@/lib/mock-data/resource-center";
import styles from "./RegulatoryBodyCard.module.css";

export function RegulatoryBodyCard({ body }: { body: RegulatoryBody }) {
  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.name}>{body.name}</div>
        <div className={styles.fullName}>{body.fullName}</div>
        <span className={styles.tag}>{body.region}</span>
      </div>
      <div className={styles.links}>
        <a href={body.websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Official Website ↗
        </a>
        <a href={body.guidanceUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Guidance Documents ↗
        </a>
      </div>
    </div>
  );
}
