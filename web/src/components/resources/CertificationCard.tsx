import type { Certification } from "@/lib/mock-data/resource-center";
import styles from "./CertificationCard.module.css";

export function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <div className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        {cert.icon}
      </span>
      <div className={styles.body}>
        <div className={styles.name}>{cert.name}</div>
        <div className={styles.desc}>{cert.description}</div>
        <div className={styles.meta}>
          <span className={styles.status}>{cert.status}</span>
          <span className={styles.validUntil}>Valid until: {cert.validUntil}</span>
        </div>
      </div>
    </div>
  );
}
