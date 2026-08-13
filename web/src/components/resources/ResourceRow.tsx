import { StatusPill } from "@/components/ui/StatusPill";
import type { ResourceItem } from "@/lib/mock-data/resources";
import styles from "./ResourceRow.module.css";

export function ResourceRow({ item }: { item: ResourceItem }) {
  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <div className={styles.title}>{item.title}</div>
        <div className={styles.desc}>{item.description}</div>
      </div>
      <StatusPill status={item.type} tone="neutral" />
    </div>
  );
}
