import { Card } from "@/components/ui/Card";
import { NewsTagBadge } from "./NewsTagBadge";
import type { PolicyNewsItem } from "@/lib/mock-data/policy-news";
import styles from "./NewsCard.module.css";

export function NewsCard({ item }: { item: PolicyNewsItem }) {
  const date = new Date(item.date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <NewsTagBadge tag={item.tag} />
        <span className={styles.meta}>
          {item.authority} · {date}
        </span>
      </div>
      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.summary}>{item.summary}</p>
    </Card>
  );
}
