import type { PolicyNewsTag } from "@/lib/mock-data/policy-news";
import styles from "./NewsTagBadge.module.css";

const TAG_CLASS: Record<PolicyNewsTag, string> = {
  Guidance: "accent",
  Update: "neutral",
  Deadline: "bad",
  Consultation: "decision",
};

export function NewsTagBadge({ tag }: { tag: PolicyNewsTag }) {
  return <span className={`${styles.badge} ${styles[TAG_CLASS[tag]]}`}>{tag}</span>;
}
