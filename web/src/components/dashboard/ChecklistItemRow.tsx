import Link from "next/link";
import type { ChecklistItem } from "@/lib/state/types";
import styles from "./ChecklistItemRow.module.css";

export function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  return (
    <Link href={item.href} className={styles.row}>
      <span className={`${styles.check} ${item.done ? styles.done : ""}`}>
        {item.done ? "✓" : ""}
      </span>
      <span className={`${styles.label} ${item.done ? styles.labelDone : ""}`}>
        {item.label}
      </span>
    </Link>
  );
}
